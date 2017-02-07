/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * ToggleLegend Button
 *
 * Button used to toggle the collapsed state of the legend.
 *
 * @class BasiGX.view.button.ToggleLegend
 */
Ext.define('BasiGX.view.button.ToggleLegend', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-togglelegend',
    requires: [
        'Ext.app.ViewModel',
        'BasiGX.util.Map'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Layerauswahl',
            text: null
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf022@FontAwesome',
    html: '<i class="fa fa-list-alt fa-2x"></i>',

    config: {
        /**
         * Placeholder for the xtype of the legendtree panel component
         * (e.g. 'basigx-panel-legendtree').
         * Will be used to be able to determine the component dynamically.
         */
        legendTreeXType: null,
        handler: function(button){
            var me = this;
            var legendPanel =
                    BasiGX.util.Map.getLegendTreePanel(me.getLegendTreeXType());

            if (legendPanel) {
                if(legendPanel.getCollapsed()) {
                    legendPanel.expand();
                } else {
                    legendPanel.collapse();
                }
                button.blur();
            }
        }
    }
});
