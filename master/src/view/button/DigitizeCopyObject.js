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
 * Digitize Copy Object Button
 *
 * @class BasiGX.view.button.DigitizeCopyObject
 */
Ext.define('BasiGX.view.button.DigitizeCopyObject', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-copy-object',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Copy an objetct',
            copyObjectBtnText: 'Copy Object'
        }
    },

    /**
     *
     */
    bind: {
        text: '{copyObjectBtnText}'
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
        copySelectInteraction: null,

        /**
         * The style function of the layer to animate the feature copy
         */
        styleFn: null
    },

    name: 'copyObjectBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            var me = this;
            if (!me.copySelectInteraction) {
                me.copySelectInteraction =
                    new ol.interaction.Select({
                        condition: function(evt) {
                            return ol.events.condition.pointerMove(evt) ||
                            ol.events.condition.click(evt);
                        },
                        addCondition: function(evt) {
                            if (evt.type === 'click') {
                                var features = me.copySelectInteraction.
                                    getFeatures().getArray();
                                if (features[0]) {
                                    var copyFeature = features[0].clone();
                                    var doneFn = function(finalFeature) {
                                        me.collection.push(finalFeature);
                                    };
                                    BasiGX.util.Animate.moveFeature(
                                        copyFeature, 500,
                                        100,
                                        me.styleFn,
                                        doneFn);
                                    me.copySelectInteraction.
                                        getFeatures().clear();
                                }
                            }
                        }
                    });
                me.map.addInteraction(me.copySelectInteraction);
            }
            if (pressed) {
                me.copySelectInteraction.setActive(true);
            } else {
                me.copySelectInteraction.setActive(false);
            }
        }
    }
});
