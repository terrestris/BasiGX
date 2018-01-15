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
 * Digitize Delete Object Button
 *
 * @class BasiGX.view.button.DigitizeDeleteObject
 */
Ext.define('BasiGX.view.button.DigitizeDeleteObject', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-delete-object',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Delete an objetct',
            deleteObjectBtnText: 'Delete Object'
        }
    },

    /**
     *
     */
    bind: {
        text: '{deleteObjectBtnText}'
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
        deleteSnapInteraction: null,

        /**
         *
         */
        deleteSelectInteraction: null
    },

    name: 'deleteObjectBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            var me = this;
            if (!me.deleteSelectInteraction) {
                var removeFeatures = function(selectedFeatures) {
                    // find the matching feature
                    selectedFeatures.forEach(function(selectedFeature) {
                        var feature = me.getFeatureFromClone(
                            selectedFeature
                        );
                        if (feature) {
                            me.collection.remove(feature);
                        }
                        me.deleteSelectInteraction.getFeatures().
                            remove(selectedFeature);
                        me.map.renderSync();
                    });
                };
                me.deleteSelectInteraction = new ol.interaction.Select({
                    condition: function(evt) {
                        return ol.events.condition.pointerMove(evt) ||
                                ol.events.condition.click(evt);
                    },
                    addCondition: function(evt) {
                        if (evt.type === 'click') {
                            var selectedFeatures =
                                me.deleteSelectInteraction.
                                    getFeatures();
                            removeFeatures(selectedFeatures, evt);
                        }
                    }
                });
                me.map.addInteraction(me.deleteSelectInteraction);

                me.deleteSnapInteraction = new ol.interaction.Snap({
                    features: me.collection
                });
                me.map.addInteraction(me.deleteSnapInteraction);
            }
            if (pressed) {
                me.deleteSelectInteraction.setActive(true);
                me.deleteSnapInteraction.setActive(true);
            } else {
                me.deleteSelectInteraction.setActive(false);
                me.deleteSnapInteraction.setActive(false);
            }
        }
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
