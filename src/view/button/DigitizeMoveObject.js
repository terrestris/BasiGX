/* Copyright (c) 2018-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Digitize Move Object Button
 *
 * @class BasiGX.view.button.DigitizeMoveObject
 */
Ext.define('BasiGX.view.button.DigitizeMoveObject', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-move-object',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Move an objetct',
            moveObjectBtnText: 'Move object'
        }
    },

    /**
     *
     */
    bind: {
        text: '{moveObjectBtnText}'
    },

    config: {
        /**
         * The ol map. required.
         */
        map: null,

        /**
         * The ol collection to work on. required.
         */
        collection: null,

        /**
         *
         */
        translateInteraction: null,

        /**
         *
         */
        translateSelectInteraction: null
    },

    name: 'moveObjectBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            var me = this;
            if (!me.translateInteraction) {
                me.translateSelectInteraction =
                    new ol.interaction.Select({
                        condition: ol.events.condition.pointerMove,
                        addCondition: function() {
                            var selectedFeatures =
                                me.translateSelectInteraction.getFeatures();
                            var firstFeature = selectedFeatures.getArray()[0];

                            if (firstFeature) {
                                var finalFeature = me.getFeatureFromClone(
                                    firstFeature);

                                if (me.translateFeatureCollection.getLength()
                                    === 0) {
                                    me.translateFeatureCollection.push(
                                        finalFeature);
                                } else if (me.
                                    translateFeatureCollection.getLength() > 0
                                    && finalFeature !== me.
                                       translateFeatureCollection.
                                       getArray()[0]) {
                                    me.translateFeatureCollection.clear();
                                    me.translateFeatureCollection.push(
                                        finalFeature);
                                }
                            }
                        }
                    });
                me.map.addInteraction(me.translateSelectInteraction);
                me.translateFeatureCollection = new ol.Collection();
                me.translateInteraction =
                   new ol.interaction.Translate({
                       features: me.translateFeatureCollection
                   });
                me.map.addInteraction(me.translateInteraction);
            }
            if (pressed) {
                me.translateInteraction.setActive(true);
                me.translateSelectInteraction.setActive(true);
                me.translateInteraction.on('translateend',
                    me.fireFeatureChanged, me);
            } else {
                me.translateInteraction.setActive(false);
                me.translateSelectInteraction.setActive(false);
                me.translateInteraction.un('translateend',
                    me.fireFeatureChanged, me);
            }
        }
    },

    /**
     * Fire a change event to inform other components
     */
    fireFeatureChanged: function() {
        this.fireEvent('featurechanged');
    },

    /**
     * @param {ol.Feature} clone The cloned feature to get the feature from.
     * @return {ol.Feature} The final feature derived from the `clone`.
     */
    getFeatureFromClone: function(clone) {
        var finalFeature;
        var wktParser = new ol.format.WKT();
        var cloneWktString = wktParser.writeFeature(clone);
        Ext.each(this.collection.getArray(), function(feature) {
            var featureWktString = wktParser.writeFeature(feature);
            if (cloneWktString === featureWktString) {
                finalFeature = feature;
                return false;
            }
        });
        return finalFeature;
    }
});
