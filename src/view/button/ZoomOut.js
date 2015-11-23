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
        text: '{text}'
    },

    /**
     *
     */
    glyph: 'xf010@FontAwesome',

    config: {
        handler: function() {
            var olMap = Ext.ComponentQuery.query('basigx-component-map')[0].getMap();
            var olView = olMap.getView();
            var zoom = ol.animation.zoom({
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
        if (this.setTooltip) {
            var bind = this.config.bind;
            bind.tooltip = this.getViewModel().get('tooltip');
            this.setBind(bind);
        }
    }
});
