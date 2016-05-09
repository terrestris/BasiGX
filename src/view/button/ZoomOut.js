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
 * ZoomOut Button
 *
 * Button used to zoom out.
 *
 * @class BasiGX.view.button.ZoomOut
 */
Ext.define("BasiGX.view.button.ZoomOut", {
    extend: "Ext.Button",
    xtype: 'basigx-button-zoomout',
    requires: [
        'Ext.app.ViewModel',
        'BasiGX.util.Map'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Herauszoomen',
            text: null
        }
    },

    /**
     *
     */
    bind: {
        tooltip: '{tooltip}',
        text: '{text}'
    },

    /**
     * The OL3 map this button is bounded to
     */
    olMap: null,

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf010@FontAwesome',
    html: '<i class="fa fa-search-minus fa-2x"></i>',

    config: {
        handler: function() {
            var me = this,
                olMap = me.olMap,
                olView,
                zoom;

            // fallback
            if (Ext.isEmpty(olMap)) {
                olMap = BasiGX.util.Map.getMapComponent();
            }

            olView = olMap.getView();
            zoom = ol.animation.zoom({
                resolution: olView.getResolution(),
                duration: 500
            });

            olMap.beforeRender(zoom);
            olView.setResolution(olView.getResolution() * 2);
        }
    },

    /**
     *
     */
    constructor: function(config) {
        this.callParent([config]);
    }
});
