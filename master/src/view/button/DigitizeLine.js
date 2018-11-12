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
 * Digitize Line Button
 *
 * @class BasiGX.view.button.DigitizeLine
 */
Ext.define('BasiGX.view.button.DigitizeLine', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-line',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Digitize a new line',
            digitizeLineText: 'Digitize line'
        }
    },

    /**
     *
     */
    bind: {
        text: '{digitizeLineText}'
    },

    config: {
        layer: null,
        map: null,
        collection: null,
        multi: false
    },

    name: 'drawLineBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            if (!this.drawLineInteraction) {
                var cfg = {
                    type: this.getMulti() ? 'MultiLineString' : 'LineString'
                };
                if (this.getLayer()) {
                    cfg.source = this.getLayer().getSource();
                } else {
                    cfg.features = this.getCollection();
                }
                this.drawLineInteraction = new ol.interaction.Draw(cfg);
                this.getMap().addInteraction(this.drawLineInteraction);
            }
            if (pressed) {
                this.drawLineInteraction.setActive(true);
            } else {
                this.drawLineInteraction.setActive(false);
            }
        },
        beforedestroy: function() {
            if (this.drawLineInteraction) {
                this.map.removeInteraction(this.drawLineInteraction);
            }
        }
    }


});
