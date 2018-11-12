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
        'BasiGX.util.Digitize'
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
                        addCondition: function(event) {
                            if (event.dragging) {
                                return;
                            }
                            var selectedFeatures =
                                this.getFeatures();
                            var firstFeature = selectedFeatures.getArray()[0];

                            if (firstFeature) {
                                var finalFeature = BasiGX.util.Digitize.
                                    getFeatureFromClone(
                                        me.collection,
                                        firstFeature
                                    );

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
        },
        beforedestroy: function() {
            if (this.translateInteraction) {
                this.map.removeInteraction(this.translateInteraction);
            }
            if (this.translateSelectInteraction) {
                this.map.removeInteraction(this.translateSelectInteraction);
            }
        }
    },

    /**
     * Fire a change event to inform other components
     */
    fireFeatureChanged: function() {
        this.fireEvent('featurechanged');
    }
});
