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
 * ZoomToExtent Button
 *
 * Button used to zoom to Extent
 *
 */
Ext.define("BasiGX.view.button.ZoomToExtent", {
    extend: "Ext.button.Button",
    xtype: 'basigx-button-zoomtoextent',

    requires: ['BasiGX.util.Application'],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Auf Gesamtansicht zoomen',
            text: null
        }
    },

    /**
     * Center is required on instantiation.
     * Either zoom or Resolution is required on instantiation.
     */
    config: {
        center: null,
        zoom: null,
        resolution: null
    },

    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    glyph: 'xf0b2@FontAwesome',

    initComponent: function(){
        this.callParent(arguments);
        if(this.getZoom() && this.getResolution()){
            Ext.raise('Zoom and resolution set for Extent Button!' +
            'Please choose one.');
        }
        this.setConfigValues();
    },

    /**
     *
     */
    setConfigValues: function(){
        var appContext = BasiGX.util.Application.getAppContext();

        if(appContext){
            if(!this.getCenter()){
                this.setCenter(appContext.startCenter);
            }
            if(!this.getZoom() && !this.getResolution()){
                this.setZoom(appContext.startZoom);
            }
        }
    },

    /**
    *
    */
    handler: function(button){
        this.setConfigValues();

        // TODO refactor so this works even outside of the mapcontainer
        var olMap = button.up("basigx-panel-mapcontainer")
           .down('gx_map').getMap();
        var olView = button.up("basigx-panel-mapcontainer")
           .down('gx_map').getView();
        var targetCenter = this.getCenter();
        var targetResolution = this.getResolution();
        var targetZoom = this.getZoom();
        var pan = ol.animation.pan({
                source: olView.getCenter()
            });
        var zoom = ol.animation.zoom({
               resolution: olView.getResolution()
            });

        olMap.beforeRender(pan);
        olMap.beforeRender(zoom);
        olView.setCenter(targetCenter);

        if(targetZoom){
            olView.setZoom(targetZoom);
        } else {
            olView.setResolution(targetResolution);
        }
    }

});
