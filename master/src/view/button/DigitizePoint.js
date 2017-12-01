/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * Digitize Point Button
 *
 * @class BasiGX.view.button.DigitizePoint
 */
Ext.define('BasiGX.view.button.DigitizePoint', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-point',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Digitize a new point',
            digitizePointText: 'Digitize point'
        }
    },

    /**
     *
     */
    bind: {
        text: '{digitizePointText}'
    },

    config: {
        layer: null,
        map: null,
        collection: null
    },

    name: 'drawPointBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            if (!this.drawPointInteraction) {
                var cfg = {
                    type: 'Point'
                };
                if (this.getLayer()) {
                    cfg.source = this.getLayer().getSource();
                } else {
                    cfg.features = this.getCollection();
                }
                this.drawPointInteraction = new ol.interaction.Draw(cfg);
                this.getMap().addInteraction(this.drawPointInteraction);
            }
            if (pressed) {
                this.drawPointInteraction.setActive(true);
            } else {
                this.drawPointInteraction.setActive(false);
            }
        }
    }


});
