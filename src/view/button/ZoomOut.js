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
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("BasiGX.view.button.ZoomOut", {
    extend: "Ext.button.Button",
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

    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    glyph: 'xf010@FontAwesome',

    /**
    *
    */
   handler: function(button){
       // TODO refactor so this works even outside of the mapcontainer
       var olMap = button.up("basigx-panel-mapcontainer")
           .down('gx_map').getMap();
       var olView = button.up("basigx-panel-mapcontainer")
           .down('gx_map').getView();
       var zoom = ol.animation.zoom({
           resolution: olView.getResolution(),
           duration: 500
       });

       olMap.beforeRender(zoom);
       olView.setResolution(olView.getResolution() * 2);
   }

});
