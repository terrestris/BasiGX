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
 * ConfigParser Util
 *
 * parses an application context in JSON Format
 * in order to generate ol3 based layers and map with the given configuration.
 * Example appContext response from SHOGun 2:
 
    {
        id: 74,
        created: "2016-03-11T09:23:45.015+01:00",
        modified: "2016-03-11T09:28:47.973+01:00",
        name: "Simple Web Map",
        description: "Default Application",
        language: null,
        open: true,
        active: true,
        url: null,
        viewport: {
            id: 72,
            name: "Viewport with Border Layout",
            xtype: "viewport",
            properties: {},
            layout: {
                id: 14,
                type: "border",
                propertyHints: [
                    "split",
                    "title",
                    "collapsible"
                ],
                propertyMusts: [
                    "region"
                ],
                regions: [
                    "center",
                    "north",
                    "west"
                ]
            },
            subModules: [{
                id: 62,
                name: "Map Container",
                xtype: "container",
                properties: {
                    width: "100%",
                    region: "center",
                    height: "100%"
                },
                layout: {
                    id: 15,
                    type: "absolute",
                    propertyHints: [],
                    propertyMusts: [
                        "x",
                        "y"
                    ],
                    coords: []
                },
                subModules: [{
                    id: 60,
                    name: "Main Map",
                    xtype: "mm_component_map",
                    properties: {
                        x: 0,
                        width: "100%",
                        y: 0,
                        height: "100%"
                    },
                    mapConfig: {
                        id: 53,
                        name: "default",
                        center: {
                            x: 829473,
                            y: 6708897
                        },
                        extent: {
                            id: 52,
                            lowerLeft: {
                                x: -20026376.39,
                                y: -20048966.1
                            },
                            upperRight: {
                                x: 20026376.39,
                                y: 20048966.1
                            }
                        },
                        resolutions: [
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
                        zoom: 16,
                        maxResolution: 0.5971642833948135,
                        minResolution: 156543.03390625,
                        rotation: 0,
                        projection: "3857"
                    },
                    mapControls: [{
                        id: 47,
                        mapControlName: "Attribution",
                        mapControlProperties: {}
                    }, {
                        id: 49,
                        mapControlName: "Rotate",
                        mapControlProperties: {}
                    }, {
                        id: 50,
                        mapControlName: "ZoomSlider",
                        mapControlProperties: {}
                    }, {
                        id: 51,
                        mapControlName: "ScaleLine",
                        mapControlProperties: {
                            units: "metric"
                        }
                    }, {
                        id: 48,
                        mapControlName: "Zoom",
                        mapControlProperties: {}
                    }],
                    mapLayers: [{
                        id: 46,
                        name: "OSM Layers",
                        type: "Group",
                        layers: [{
                            id: 45,
                            name: "OSM-WMS GRAY",
                            type: "Tile",
                            source: {
                                id: 42,
                                name: null,
                                type: "TileWMS",
                                url: "http://ows.terrestris.de/osm-gray/service?",
                                width: 256,
                                height: 256,
                                version: "1.1.0",
                                layerNames: [
                                    "OSM-WMS"
                                ],
                                layerStyles: [
                                    ""
                                ],
                                tileGrid: {
                                    id: 38,
                                    type: "TileGrid",
                                    tileGridOrigin: {
                                        x: 0,
                                        y: 0
                                    },
                                    tileGridExtent: {
                                        id: 37,
                                        lowerLeft: {
                                            x: -20026376.39,
                                            y: -20048966.1
                                        },
                                        upperRight: {
                                            x: 20026376.39,
                                            y: 20048966.1
                                        }
                                    },
                                    tileSize: 256,
                                    tileGridResolutions: [
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
                                    ]
                                }
                            },
                            appearance: {
                                id: 43,
                                attribution: "© <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a> <br>",
                                name: null,
                                maxResolution: 156543.03390625,
                                minResolution: 0.5971642833948135,
                                opacity: 1,
                                visible: true
                            }
                        }]
                    }, {
                        id: 44,
                        name: "OSM-WMS",
                        type: "Tile",
                        source: {
                            id: 41,
                            name: null,
                            type: "TileWMS",
                            url: "http://ows.terrestris.de/osm/service?",
                            width: 256,
                            height: 256,
                            version: "1.1.0",
                            layerNames: [
                                "OSM-WMS"
                            ],
                            layerStyles: [
                                ""
                            ],
                            tileGrid: {
                                id: 38,
                                type: "TileGrid",
                                tileGridOrigin: {
                                    x: 0,
                                    y: 0
                                },
                                tileGridExtent: {
                                    id: 37,
                                    lowerLeft: {
                                        x: -20026376.39,
                                        y: -20048966.1
                                    },
                                    upperRight: {
                                        x: 20026376.39,
                                        y: 20048966.1
                                    }
                                },
                                tileSize: 256,
                                tileGridResolutions: [
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
                                ]
                            }
                        },
                        appearance: {
                            id: 43,
                            attribution: "© <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a> <br>",
                            name: null,
                            maxResolution: 156543.03390625,
                            minResolution: 0.5971642833948135,
                            opacity: 1,
                            visible: true
                        }
                    }, {
                        id: 45,
                        name: "OSM-WMS GRAY",
                        type: "Tile",
                        source: {
                            id: 42,
                            name: null,
                            type: "TileWMS",
                            url: "http://ows.terrestris.de/osm-gray/service?",
                            width: 256,
                            height: 256,
                            version: "1.1.0",
                            layerNames: [
                                "OSM-WMS"
                            ],
                            layerStyles: [
                                ""
                            ],
                            tileGrid: {
                                id: 38,
                                type: "TileGrid",
                                tileGridOrigin: {
                                    x: 0,
                                    y: 0
                                },
                                tileGridExtent: {
                                    id: 37,
                                    lowerLeft: {
                                        x: -20026376.39,
                                        y: -20048966.1
                                    },
                                    upperRight: {
                                        x: 20026376.39,
                                        y: 20048966.1
                                    }
                                },
                                tileSize: 256,
                                tileGridResolutions: [
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
                                ]
                            }
                        },
                        appearance: {
                            id: 43,
                            attribution: "© <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a> <br>",
                            name: null,
                            maxResolution: 156543.03390625,
                            minResolution: 0.5971642833948135,
                            opacity: 1,
                            visible: true
                        }
                    }]
                }, {
                    id: 61,
                    name: "Tools Container",
                    xtype: "container",
                    properties: {
                        shadow: false,
                        floating: true,
                        defaultAlign: "tr-tr",
                        width: 100,
                        autoShow: true
                    },
                    layout: {
                        id: 17,
                        type: "vbox",
                        propertyHints: [
                            "flex",
                            "height"
                        ],
                        propertyMusts: []
                    },
                    subModules: [{
                        id: 56,
                        name: "Hover Select Info Button",
                        xtype: "mapmavin-hsiButton",
                        properties: {
                            mapmavinTool: true,
                            iconCls: "fa fa-info-circle"
                        },
                        text: null,
                        tooltip: null,
                        glyph: null,
                        connectedModule: null,
                        interaction: null,
                        buttonAction: null
                    }]
                }]
            }, {
                id: 70,
                name: "Viewport Header",
                xtype: "panel",
                properties: {
                    cls: "mm-viewport-header",
                    region: "north",
                    bodyCls: "mm-viewport-header-body",
                    responsiveConfig: "tall=height:60;wide=height:120"
                },
                layout: {
                    id: 16,
                    type: "hbox",
                    propertyHints: [
                        "flex",
                        "width"
                    ],
                    propertyMusts: []
                },
                subModules: [{
                    id: 67,
                    name: "Logo Image",
                    xtype: "imagecomponent",
                    properties: {
                        src: "resources/img/MapMavin_Logo_green_white.svg",
                        cls: "mm-header-logo",
                        responsiveConfig: "tall=height:60,width:110;wide=height:120,width:220,margin:0px 65px 10px 65px"
                    },
                    src: null,
                    link: null,
                    altText: null
                }, {
                    id: 69,
                    name: "Logo Title",
                    xtype: "displayfield",
                    properties: {
                        fieldCls: "mm-header-title-field",
                        value: "Simple Web Map",
                        responsiveConfig: "tall=height:60,width:200;wide=height:120,flex:1",
                        fieldBodyCls: "mm-header-title-field-body"
                    }
                }, {
                    id: 68,
                    name: "Custom Logo Image",
                    xtype: "imagecomponent",
                    properties: {
                        margin: "0 65 10 65",
                        src: "resources/img/logo_terrestris.svg",
                        cls: "mm-header-logo",
                        responsiveConfig: "tall=height:60,width:110;wide=height:120,width:220"
                    },
                    src: null,
                    link: null,
                    altText: null
                }, {
                    id: 66,
                    name: "Header Right Container",
                    xtype: "container",
                    properties: {
                        fieldCls: "mm-header-right-container",
                        width: 250
                    },
                    layout: {
                        id: 17,
                        type: "vbox",
                        propertyHints: [
                            "flex",
                            "height"
                        ],
                        propertyMusts: []
                    },
                    subModules: [{
                        id: 63,
                        name: "Login Button",
                        xtype: "button",
                        properties: {
                            margin: "5 0 0 0",
                            width: 220,
                            text: "Login",
                            iconCls: "fa fa-sign-in",
                            responsiveConfig: "tall=hidden:true;wide=hidden:false"
                        }
                    }, {
                        id: 64,
                        name: "Live Session Button",
                        xtype: "button",
                        properties: {
                            fieldCls: "mm-live-session-button",
                            margin: "5 0 0 0",
                            width: 220,
                            text: "Start Live Session",
                            iconCls: "fa fa-pencil-square-o",
                            responsiveConfig: "tall=hidden:true;wide=hidden:false"
                        }
                    }, {
                        id: 65,
                        name: "Gazetter Search",
                        xtype: "combobox",
                        properties: {
                            hideTrigger: true,
                            margin: "5 0 0 0",
                            emptyText: "Gazetter Search",
                            width: 220,
                            responsiveConfig: "tall=hidden:true;wide=hidden:false"
                        }
                    }]
                }]
            }, {
                id: 71,
                name: "Legend Tree",
                xtype: "mm_panel_legendtree",
                properties: {
                    region: "west",
                    title: "Layer Panel",
                    responsiveConfig: "tall=collapsed:true;wide=collapsed:false"
                }
            }]
        },
        logoKey: null,
        theme: "gray"
    }

 * @class BasiGX.util.ConfigParser2
 */
Ext.define('BasiGX.util.ConfigParser2', {

    autocreateLegends: false,

    activeRouting: false,

    statics: {

        /**
        *
        */
       setMap: function() {
           var me = this;
           var view = me.getView();

           if (!view.getMap()) {
               var olMap = me.createOlMap();
               view.setMap(olMap);
           }
       },

       /**
        *
        */
       createOlMapControls: function(mapControls) {
           var mapCtrls = [];

           // iterate over all control configurations
           Ext.each(mapControls, function(mapControl) {
               // create the ol3 control
               var mapCtrl = new ol.control[mapControl.mapControlName](
                       mapControl.mapControlProperties);
               mapCtrls.push(mapCtrl);
           });

           return mapCtrls;
       },

       /**
        * load the default interactions only, specific interactions
        * should be loaded and added by single modules.
        */
       createOlMap: function() {
           var me = this;
           var appCtxUtil = Mapmavin.client.util.ApplicationContext;
           var mapConfig = appCtxUtil.getMapConfig();
           var mapControls = appCtxUtil.getMapControls();
           var map;

           if (!mapConfig) {
               Ext.Logger.error('No mapConfig object found!');
               return false;
           }

           map = new ol.Map({
               controls: me.createOlMapControls(mapControls),
               logo: false,
               renderer: me.createOlMapRenderer(),
               view: me.createOlMapView(mapConfig),
               // need the following to get keyboard navigation working
               keyboardEventTarget: document
           });

           var layerGroup = new ol.layer.Group({layers: me.createOlLayers()});
           map.setLayerGroup(layerGroup);

           return map;
       },

       /**
        * Returns the map renderer to use.
        */
       createOlMapRenderer: function() {
           return 'canvas';
       },

       /**
        *
        */
       createOlMapView: function(mapConfig) {
           var me = this;
           var olMapView;

           olMapView = new ol.View({
               center: [
                   mapConfig.center.x,
                   mapConfig.center.y
               ],
               zoom: mapConfig.zoom || 2,
               maxResolution: mapConfig.maxResolution,
               minResolution: mapConfig.minResolution,
               extent: [
                   mapConfig.extent.lowerLeft.x,
                   mapConfig.extent.lowerLeft.y,
                   mapConfig.extent.upperRight.x,
                   mapConfig.extent.upperRight.y
               ],
               projection: me.getProjectionString(),
               resolutions: mapConfig.resolutions,
               rotation: mapConfig.rotation || 0
           });

           return olMapView;
       },

       /**
        *
        */
       createOlLayers: function() {
           var me = this;
           var appCtxUtil = Mapmavin.client.util.ApplicationContext;
           var mapLayers = appCtxUtil.getValue('mapLayers');
           var olLayers = [];

           // reverse the layers array to obtain the given order by the
           // context
           Ext.each(mapLayers.reverse(), function(mapLayer) {
               olLayers.push(me.createOlLayer(mapLayer));
           });

           return olLayers;
       },

       /**
        *
        */
       createOlLayer: function(mapLayer) {
           var me = this;
           var mapLayerAppearance = mapLayer.appearance;

           // check for required options
           if (!mapLayer.type) {
               Ext.Logger.warn('Could not create the ol.layer. Missing ' +
                   'property type');
               return false;
           }

           if(mapLayer.type !== "Group"){
               var olLayer = new ol.layer[mapLayer.type]({
                   name: mapLayer.name || 'UNNAMED LAYER',
                   opacity: mapLayerAppearance.opacity,
                   visible: mapLayerAppearance.visible,
                   minResolution: mapLayerAppearance.minResolution,
                   maxResolution: mapLayerAppearance.maxResolution,
                   source: me.createOlLayerSource(mapLayer)
               });
           } else { // Grouplayer
               var groupLayers = [];

               Ext.each(mapLayer.layers, function(childLayer){
                   // check for required options
                   if (!childLayer.type) {
                       Ext.Logger.warn('Could not create the ol.layer. Missing ' +
                           'property type');
                       return false;
                   }

                   //TODO We don't catch if a layer allready exists
                   groupLayers.push(new ol.layer[childLayer.type]({
                       name: childLayer.name || 'UNNAMED LAYER',
                       opacity: childLayer.opacity,
                       visible: childLayer.visible,
                       minResolution: childLayer.minResolution,
                       maxResolution: childLayer.maxResolution,
                       source: me.createOlLayerSource(childLayer)
                   }));
               });

               var olLayer = new ol.layer.Group({
                   name: mapLayer.name || 'UNNAMED LAYER',
                   layers: groupLayers
               });

           }

           return olLayer;
       },

       /**
        * based on ol.source.TileWMS
        */
       createOlLayerSource: function(mapLayer) {
           var me = this;
           var mapLayerAppearance = mapLayer.appearance;
           var mapLayerSource = mapLayer.source;
           var olLayerSource;

           olLayerSource = new ol.source[mapLayerSource.type]({
               attributions: me.createOlLayerAttribution(
                       mapLayerAppearance.attribution),
               params: {
                   'LAYERS': mapLayerSource.layerNames,
                   'VERSION': mapLayerSource.version,
                   'TILED': true
               },
               crossOrigin: mapLayerSource.crossOrigin || null,
               gutter: mapLayerSource.gutter || 0,
               logo: {
                   href: mapLayerSource.logoHref || "",
                   src: mapLayerSource.logoSrc || ""
               },
               tileGrid: me.createOlLayerTileGrid(
                       mapLayerSource.tileGrid),
               url: mapLayerSource.url
           });

           return olLayerSource;
       },

       /**
        *
        */
       createOlLayerTileGrid: function(tileGridConfig) {
           var olLayerTileGrid;
           var tileGridOrigin;
           var tileGridExtent;

           // check for required options
           if (!tileGridConfig.type || !tileGridConfig.tileGridResolutions) {
               Ext.Logger.warn('Could not create the ol.tilegrid for the ' +
                       'current layer. Missing properties type and/or ' +
                       'tileGridResolutions');
               return false;
           }

           if (tileGridConfig.tileGridOrigin) {
               tileGridOrigin = [
                   tileGridConfig.tileGridOrigin.x,
                   tileGridConfig.tileGridOrigin.y
               ];
           }

           if (tileGridConfig.tileGridExtent) {
               tileGridExtent = [
                   tileGridConfig.tileGridExtent.lowerLeft.x,
                   tileGridConfig.tileGridExtent.lowerLeft.y,
                   tileGridConfig.tileGridExtent.upperRight.x,
                   tileGridConfig.tileGridExtent.upperRight.y
               ];
           }

           olLayerTileGrid = new ol.tilegrid[tileGridConfig.type]({
               extent: tileGridExtent,
               origin: tileGridOrigin,
               resolutions: tileGridConfig.tileGridResolutions,
               tileSize: tileGridConfig.tileSize || 256
           });

           return olLayerTileGrid;
       },

       /**
        *
        */
       createOlLayerAttribution: function(attributionConfig) {
           var olLayerAttributions = [];

           var olLayerAttribution = new ol.Attribution({
               html: attributionConfig
           });

           olLayerAttributions.push(olLayerAttribution);

           return olLayerAttributions;
       },

       /**
        *
        */
       getProjectionString: function() {
           var appCtxUtil = Mapmavin.client.util.ApplicationContext;
           var mapConfig = appCtxUtil.getMapConfig();
           var mapConfigProjection = mapConfig.projection;

           if (!mapConfigProjection) {
               Ext.Logger.error('No map projection found in mapConfig!');
           }

           if (mapConfigProjection.indexOf('EPSG') > -1) {
               return mapConfigProjection;
           } else {
               return Ext.String.format('EPSG:{0}', mapConfigProjection);
           }
       }
    }
});
