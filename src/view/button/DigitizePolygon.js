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
 * Digitize Polygon Button
 *
 * @class BasiGX.view.button.DigitizePolygon
 */
Ext.define('BasiGX.view.button.DigitizePolygon', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-polygon',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Digitize a new polygon',
            digitizePolygonText: 'Digitize polygon'
        }
    },

    /**
     *
     */
    bind: {
        text: '{digitizePolygonText}'
    },

    config: {
        layer: null,
        map: null,
        collection: null
    },

    name: 'drawPolygonsBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            if (!this.drawPolygonInteraction) {
                var cfg = {
                    type: 'Polygon'
                };
                if (this.getLayer()) {
                    cfg.source = this.getLayer().getSource();
                } else {
                    cfg.features = this.getCollection();
                }
                this.drawPolygonInteraction = new ol.interaction.Draw(cfg);
                this.getMap().addInteraction(this.drawPolygonInteraction);
            }
            if (pressed) {
                this.drawPolygonInteraction.setActive(true);
            } else {
                this.drawPolygonInteraction.setActive(false);
            }
        }
    }


});
