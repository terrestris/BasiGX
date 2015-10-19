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
 * Map Component
 *
 * Setting up a ol3-map by calling the config parser with the given appContext.
 * If no appContext is found, a default one will be loaded.
 * Class usually instanciated in map container.
 *
 */
Ext.define("BasiGX.view.component.Map", {
    extend: "GeoExt.component.Map",
    xtype: "basigx-component-map",

    requires: [
        "BasiGX.util.ConfigParser",
        "BasiGX.util.Layer"
    ],

    inheritableStatics: {
        guess: function(){
            return Ext.ComponentQuery.query('basigx-component-map')[0];
        }
    },

    /**
     * The app context
     */
    appContext: null,

    /**
     * The URL to the app Context resource.
     * Gets requested via AJAX, can be a local file or an webinterface
     */
    appContextPath: 'resources/appContext.json',

    /**
     * The appContext to use when no real context could be retrieved
     */
    fallbackAppContext: {
        "data": {
            "merge": {
                "startCenter": [1163261, 6648489],
                "startZoom": 5,
                "mapLayers": [
                    {
                        "name": "OSM WMS",
                        "type": "TileWMS",
                        "url": "http://ows.terrestris.de/osm/service?",
                        "layers": "OSM-WMS",
                        "topic": false
                    }
                ],
                "mapConfig": {
                    "projection": "EPSG:3857",
                    "resolutions": [
                        156543.03390625,
                        78271.516953125,
                        39135.7584765625,
                        19567.87923828125,
                        9783.939619140625,
                        4891.9698095703125,
                        2445.9849047851562,
                        1222.9924523925781,
                        611.4962261962891,
                        305.74811309814453,
                        152.87405654907226,
                        76.43702827453613,
                        38.218514137268066,
                        19.109257068634033,
                        9.554628534317017,
                        4.777314267158508,
                        2.388657133579254,
                        1.194328566789627,
                        0.5971642833948135
                    ],
                    "zoom": 0
                }
            }
        }
    },

    /**
     * If this class is extended by an application that uses controllers,
     * this property should be set to false and the corresponding methods
     * have to be implemented in the controller.
     */
    defaultListenerScope: true,

    /**
     * flag determines if the layers created by configparser should contain
     * automatically generated legendurls
     */
    autocreateLegends: false,

    /**
     * flag determines if the the window.location.hash should be manipulated
     * during runtime
     */
    activeRouting: false,

    constructor: function(config) {
        var me = this;

        if (!me.getMap()){

            // need to handle config first as its not applied yet
            var url = config && config.appContextPath ?
                config.appContextPath : me.appContextPath;

            Ext.Ajax.request({
                url: url,
                async: false,
                success: function(response){
                    if(Ext.isString(response.responseText)) {
                        me.appContext = Ext.decode(response.responseText);
                    } else if(Ext.isObject(response.responseText)) {
                        me.appContext = response.responseText;
                    } else {
                        Ext.log.error("Error! Could not parse appContext!");
                    }
                },
                failure: function(response) {
                    Ext.log.error("Error! No application " +
                        "context found, example loaded", response);
                    me.appContext = me.fallbackAppContext;
                }
            });

            BasiGX.util.ConfigParser.autocreateLegends =
                config.autocreateLegends;

            BasiGX.util.ConfigParser.activeRouting =
                config.activeRouting;

            var olMap = BasiGX.util.ConfigParser.setupMap(me.appContext);
            me.setMap(olMap);
        }

        me.addControls();

        me.callParent([config]);
    },

    addControls: function(){
        var map = this.getMap();
        var attribution = new ol.control.Attribution({
            collapsible: false,
            logo: false
        });
        map.addControl(attribution);
    }

});
