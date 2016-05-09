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
 * @class BasiGX.view.button.ZoomToExtent
 */
Ext.define("BasiGX.view.button.ZoomToExtent", {
    extend: "Ext.Button",
    xtype: 'basigx-button-zoomtoextent',

    requires: [
        'BasiGX.util.Application',
        'BasiGX.util.Map',
        'Ext.app.ViewModel'
    ],

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
     * Center is required on instantiation.
     * Either zoom or Resolution is required on instantiation.
     */
    config: {
        center: null,
        zoom: null,
        resolution: null,
        handler: function(){
            this.setConfigValues();

            var olMap = this.olMap;

            //fallback
            if (Ext.isEmpty(olMap)) {
                olMap = BasiGX.util.Map.getMapComponent();
            }

            var olView = olMap.getView(),
                targetCenter = this.getCenter(),
                targetResolution = this.getResolution(),
                targetZoom = this.getZoom(),
                pan = ol.animation.pan({
                    source: olView.getCenter()
                }),
                zoom = ol.animation.zoom({
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
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf0b2@FontAwesome',
    html: '<i class="fa fa-arrows-alt fa-2x"></i>',

    /**
     *
     */
    constructor: function(config) {
        this.callParent([config]);

        if(this.getZoom() && this.getResolution()){
            Ext.raise('No zoom and resolution set for Extent Button!' +
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
    }
});
