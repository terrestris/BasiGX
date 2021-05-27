/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * Parses an application context in JSON Format
 * in order to generate ol based layers and map with the given configuration.
 * @class BasiGX.util.ConfigParser
 */
/* Example appContext response from SHOGun 1:
 *
 *     {
 *       "data":{
 *         "merge":{
 *           "id":3841,
 *           "created_at":"04.05.2015 12:05:29",
 *           "updated_at":"04.05.2015 12:05:29",
 *           "app_user":"default",
 *           "name":"test",
 *           "language":"DE",
 *           "open":false,
 *           "active":true,
 *           "css":"ext-all.css",
 *           "description":null,
 *           "shortdescription":null,
 *           "url":"client/gisclient/index-dev.html",
 *           "startCenter":"385067,5535472",
 *           "startZoom":"0",
 *           "startResolution":"560",
 *           "startBbox":"-106720,4973280,1040160,6406880",
 *           "specialinstance":false,
 *           "zoomslider":true,
 *           "applicationheader":true,
 *           "initiallegendvisibility":true,
 *           "editableForCurrentUser":false,
 *           "initiallyactivetoolpertab":"t_pan_button",
 *           "initialwestpanelstate":300,
 *           "initialstatusbarstate":"full",
 *           "mapLayers":[
 *             {
 *               "id":230,
 *               "created_at":"16.03.2015 11:55:48",
 *               "updated_at":"16.03.2015 11:55:48",
 *               "app_user":"auto-create-on-init",
 *               "name":"(mainz) Klimatische Wasserbilanz",
 *               "type":"WMS",
 *               "isBaseLayer":false,
 *               "alwaysInRange":null,
 *               "visibility":true,
 *               "displayInLayerSwitcher":true,
 *               "attribution":null,
 *               "gutter":null,
 *               "projection":null,
 *               "units":null,
 *               "scales":null,
 *               "resolutions":null,
 *               "maxExtent":null,
 *               "minExtent":null,
 *               "maxResolution":null,
 *               "minResolution":null,
 *               "maxScale":null,
 *               "minScale":null,
 *               "numZoomLevels":null,
 *               "displayOutsideMaxExtent":false,
 *               "transitionEffect":null,
 *               "metadata":[],
 *               "groups":[
 *                 20,
 *                 19,
 *                 23
 *               ],
 *               "owner":null,
 *               "additionalOwners":[],
 *               "url":"/GDAWasser/geoserver.action",
 *               "layers":"GDA_Wasser:WRRL_WASSERBILANZ_EINSTUFUNG",
 *               "transparent":true,
 *               "singleTile":false,
 *               "ratio":null,
 *               "format":"image/png8",
 *               "language":"de",
 *               "description":null,
 *               "exportable":true,
 *               "queryableInfoFormat":null,
 *               "editableForCurrentUser":false,
 *               "sysLayer":true,
 *               "digiLayer":false,
 *               "specialLayer":false,
 *               "specialLayerUrlTemplate":null,
 *               "specialLayerWinWidth":null,
 *               "specialLayerWinHeight":null,
 *               "hoverField":"{{GEMEINDE_BEZ}}",
 *               "dataLayerWindowTitle":null,
 *               "layerStyleConfigurable":null,
 *               "temporaryLayer":false,
 *               "rasterLayer":false,
 *               "rasterLayerFeatureInfo":null,
 *               "dataLayer":false,
 *               "waterCourseLevel":0,
 *               "geometryType":null,
 *               "layerGroupName":null,
 *               "tiled":true
 *             }
 *           ],
 *           "grantedOverviewMapLayers":null,
 *           "overviewMapLayers":[],
 *           "grantedMapLayers":null,
 *           "mapConfig":{
 *             "id":13,
 *             "created_at":"16.03.2015 11:55:49",
 *             "updated_at":"16.03.2015 11:55:49",
 *             "app_user":"auto-create-on-init",
 *             "name":"default-mapconfig",
 *             "mapId":"stdmap",
 *             "title":"Map",
 *             "projection":"EPSG:25832",
 *             "units":"m",
 *             "maxResolution":560,
 *             "maxExtent":"-106720,4973280,1040160,6406880",
 *             "center":"385067,5535472",
 *             "resolutions":"560, 280, 140, 70, 28, 14, 7, 2.8, 1.4",
 *             "scales":null,
 *             "zoom":0
 *           },
 *           "grantedMapConfig":null,
 *           "modules":[
 *             {
 *               "id":1,
 *               "created_at":"16.03.2015 11:55:49",
 *               "updated_at":"16.03.2015 11:55:49",
 *               "app_user":"auto-create-on-init",
 *               "module_name":"layertreepanel",
 *               "module_fullname":"Standard Layer Tree",
 *               "region":"west",
 *               "isDefault":true,
 *               "type":"internet"
 *             },
 *             {
 *               "id":3,
 *               "created_at":"16.03.2015 11:55:49",
 *               "updated_at":"16.03.2015 11:55:49",
 *               "app_user":"auto-create-on-init",
 *               "module_name":"overviewmappanel",
 *               "module_fullname":"Standard Overview Map",
 *               "region":"west",
 *               "isDefault":true,
 *               "type":"internet"
 *             },
 *             {
 *               "id":2,
 *               "created_at":"16.03.2015 11:55:49",
 *               "updated_at":"16.03.2015 11:55:49",
 *               "app_user":"auto-create-on-init",
 *               "module_name":"layerlistpanel",
 *               "module_fullname":"Standard Layer List",
 *               "region":"west",
 *               "isDefault":true,
 *               "type":"internet"
 *             }
 *           ],
 *           "grantedModules":null,
 *           "groups":[],
 *           "grantedGroups":null,
 *           "orderedMapTools":[
 *             {
 *               "id":3847,
 *               "created_at":"04.05.2015 12:05:29",
 *               "updated_at":"04.05.2015 12:05:29",
 *               "app_user":"default",
 *               "module":{
 *                 "id":4,
 *                 "created_at":"16.03.2015 11:55:49",
 *                 "updated_at":"16.03.2015 11:55:49",
 *                 "app_user":"auto-create-on-init",
 *                 "module_name":"navigation_select",
 *                 "module_fullname":"Werkzeuge zum Navigieren",
 *                 "region":"maptoolbar",
 *                 "isDefault":false,
 *                 "type":"intranet"
 *               },
 *               "tbIndex":0
 *             },
 *             {
 *               "id":3848,
 *               "created_at":"04.05.2015 12:05:29",
 *               "updated_at":"04.05.2015 12:05:29",
 *               "app_user":"default",
 *               "module":{
 *                 "id":5,
 *                 "created_at":"16.03.2015 11:55:50",
 *                 "updated_at":"16.03.2015 11:55:50",
 *                 "app_user":"auto-create-on-init",
 *                 "module_name":"query_evaluate",
 *                 "module_fullname":"Werkzeuge zum Abfragen",
 *                 "region":"maptoolbar",
 *                 "isDefault":false,
 *                 "type":"intranet"
 *               },
 *               "tbIndex":1
 *             },
 *             {
 *               "id":3849,
 *               "created_at":"04.05.2015 12:05:29",
 *               "updated_at":"04.05.2015 12:05:29",
 *               "app_user":"default",
 *               "module":{
 *                 "id":6,
 *                 "created_at":"16.03.2015 11:55:50",
 *                 "updated_at":"16.03.2015 11:55:50",
 *                 "app_user":"auto-create-on-init",
 *                 "module_name":"print_load_save",
 *                 "module_fullname":"Werkzeuge zum Drucken",
 *                 "region":"maptoolbar",
 *                 "isDefault":false,
 *                 "type":"intranet"
 *               },
 *               "tbIndex":2
 *             },
 *             {
 *               "id":3850,
 *               "created_at":"04.05.2015 12:05:29",
 *               "updated_at":"04.05.2015 12:05:29",
 *               "app_user":"default",
 *               "module":{
 *                 "id":7,
 *                 "created_at":"16.03.2015 11:55:50",
 *                 "updated_at":"16.03.2015 11:55:50",
 *                 "app_user":"auto-create-on-init",
 *                 "module_name":"annotate",
 *                 "module_fullname":"Werkzeuge zum Zeichnen",
 *                 "region":"maptoolbar",
 *                 "isDefault":false,
 *                 "type":"intranet"
 *               },
 *               "tbIndex":3
 *             },
 *             {
 *               "id":3851,
 *               "created_at":"04.05.2015 12:05:29",
 *               "updated_at":"04.05.2015 12:05:29",
 *               "app_user":"default",
 *               "module":{
 *                 "id":9,
 *                 "created_at":"16.03.2015 11:55:50",
 *                 "updated_at":"16.03.2015 11:55:50",
 *                 "app_user":"auto-create-on-init",
 *                 "module_name":"special_tools",
 *                 "module_fullname":"verschiedene Werkzeuge",
 *                 "region":"maptoolbar",
 *                 "isDefault":false,
 *                 "type":"intranet"
 *               },
 *               "tbIndex":4
 *             }
 *           ],
 *           "publicSearchLayer":null,
 *           "publicResponsiveSearchLayer":3,
 *           "layerTreeConfig":"{\"id\":2537,\"name\":\"Root\",\"...",
 *           "annotationGeometries":null,
 *           "owner":1254,
 *           "ownerName":"Till Adams",
 *           "additionalOwners":[],
 *           "additionalOwnerIds":null,
 *           "wpsActions":[],
 *           "targetGroup":"gisclient",
 *           "maxResolution":560,
 *           "minResolution":0.14
 *         },
 *         "loggedInDspfUserId":"6815",
 *         "loggedInUser":"Herr Till Adams",
 *         "preferences":{}
 *       },
 *       "total":1,
 *       "success":true
 *     }
 */
/* Example of a simple broken down appcontext:
 *
 *     {
 *       "data":{
 *         "merge":{
 *           "startCenter":[
 *             983487,
 *             6998170
 *           ],
 *           "startZoom":13,
 *           "mapLayers":[
 *             {
 *               "name":"Hintergrundkarten",
 *               "type":"Folder",
 *               "layers":[
 *                 {
 *                   "name":"OSM WMS Grau",
 *                   "type":"TileWMS",
 *                   "treeColor":"rgba(41, 213, 4, 0.26)",
 *                   "url":"http://ows.terrestris.de/osm-gray/service?",
 *                   "layers":"OSM-WMS",
 *                   "legendUrl":"http://examples.com/legend.png",
 *                   "topic":false
 *                 },
 *                 {
 *                   "name":"OSM WMS Farbig",
 *                   "type":"TileWMS",
 *                   "treeColor":"rgba(41, 213, 4, 0.26)",
 *                   "url":"http://ows.terrestris.de/osm/service?",
 *                   "layers":"OSM-WMS",
 *                   "legendUrl":"http://examples.com/legend.png",
 *                   "topic":false,
 *                   "visibility":false
 *                 },
 *                 {
 *                   "name":"Subfolder",
 *                   "type":"Folder",
 *                   "layers":[
 *                     {
 *                       "name":"OSM WMS Farbig",
 *                       "type":"TileWMS",
 *                       "treeColor":"rgba(41, 213, 4, 0.26)",
 *                       "url":"http://ows.terrestris.de/osm/service?",
 *                       "layers":"OSM-WMS",
 *                       "legendUrl":"http://examples.com/legend.png",
 *                       "topic":false,
 *                       "visibility":false
 *                     }
 *                   ]
 *                 }
 *               ]
 *             },
 *             {
 *               "name":"OSM POIs",
 *               "type":"Folder",
 *               "layers":[
 *                 {
 *                   "name":"Tankstellen",
 *                   "type":"WMS",
 *                   "treeColor":"rgba(161, 177, 228, 0.53)",
 *                   "url":"http://ows.terrestris.de/geoserver/osm/wms?",
 *                   "legendHeight":40,
 *                   "legendUrl":"http://examples.com/legend.png",
 *                   "layers":"osm:osm-fuel",
 *                   "topic":true,
 *                   "transparent":true,
 *                   "crossOrigin":"Anonymous"
 *                 },
 *                 {
 *                   "name":"Bushaltestellen",
 *                   "type":"WMS",
 *                   "treeColor":"rgba(161, 177, 228, 0.53)",
 *                   "url":"http://ows.terrestris.de/osm-haltestellen?",
 *                   "legendHeight":30,
 *                   "legendUrl":"http://examples.com/legend.png",
 *                   "layers":"OSM-Bushaltestellen",
 *                   "topic":true,
 *                   "transparent":true,
 *                   "crossOrigin":"Anonymous"
 *                 }
 *               ]
 *             }
 *           ],
 *           "mapConfig":{
 *             "projection":"EPSG:3857",
 *             "resolutions":[
 *               156543.03390625,
 *               78271.516953125,
 *               39135.7584765625,
 *               19567.87923828125,
 *               9783.939619140625,
 *               4891.9698095703125,
 *               2445.9849047851562,
 *               1222.9924523925781,
 *               611.4962261962891,
 *               305.74811309814453,
 *               152.87405654907226,
 *               76.43702827453613,
 *               38.218514137268066,
 *               19.109257068634033,
 *               9.554628534317017,
 *               4.777314267158508,
 *               2.388657133579254,
 *               1.194328566789627,
 *               0.5971642833948135
 *             ],
 *             "zoom":0
 *           }
 *         }
 *       }
 *     }
 */
Ext.define('BasiGX.util.ConfigParser', {

    autocreateLegends: false,

    activeRouting: false,

    appContext: null,

    statics: {

        /**
         * The layer array which will hold the the maps layers and grouplayers.
         */
        layerArray: [],

        /**
         * Method creates an ol map and its layers based on the given context
         *
         * @param {Object} context The context object
         * @return {ol.Map} An ol-map or null if an invalid context was given.
         */
        setupMap: function(context) {
            var me = this;
            var config;

            if (!context || !context.data || !context.data.merge ||
                !context.data.merge.mapConfig) {
                Ext.log.warn('Invalid context given to configParser!');
                return null;
            }

            config = context.data.merge;
            me.appContext = config;

            // TODO Refactor
            if (window.location.hash.indexOf('center') > 0) {
                var centerString = window.location.hash.split('center/')[1].
                    split('|')[0];
                config.startCenter = centerString;
            }

            me.map = new ol.Map({
                controls: [new ol.control.ScaleLine()], // TODO add attribution
                view: new ol.View({
                    center: this.convertStringToNumericArray(
                        'int', config.startCenter),
                    zoom: config.startZoom || 2,
                    maxResolution: config.maxResolution,
                    minResolution: config.minResolution,
                    projection: config.mapConfig.projection || 'EPSG:3857',
                    units: 'm',
                    resolutions: me.convertStringToNumericArray(
                        'float', config.mapConfig.resolutions)
                })
            });
            // create the layers
            me.getLayersArray(context);
            // add the layers
            var layerGroup = new ol.layer.Group({
                layers: me.layerArray.reverse()
            });
            me.map.setLayerGroup(layerGroup);

            return me.map;
        },

        /**
         * Creates an ol layer based on a config object
         *
         * @param {Object} layer - the layer object
         * @return {ol.Layer} - An ol layer object
         */
        createLayer: function(layer) {
            var me = this;
            var layerType = 'Image';
            var sourceType = 'ImageWMS';

            if (layer.type === 'TileWMS' || layer.type === 'WMS') {
                layerType = 'Tile';
                sourceType = 'TileWMS';
            } else if (layer.type === 'XYZ') {
                layerType = 'Tile';
                sourceType = 'XYZ';
            } else if (layer.type === 'WFSCluster' || layer.type === 'WFS') {
                layerType = 'Vector';
                sourceType = 'Vector';
            } else if (layer.type === 'WMTS') {
                layerType = 'WMTS';
                sourceType = 'WMTS';
            }

            var source = me.getSourceForType(layer, sourceType);
            return me.getLayerForType(layer, layerType, source);
        },

        /**
         * Returns an OpenLayers source for the passed config and given type.
         *
         * @param {Object} config The layer configuration.
         * @param {String} sourceType The type of the source to create.
         * @return {ol.source.Source} An OpenLayers source.
         */
        getSourceForType: function(config, sourceType) {

            var me = this;
            var map = me.map;
            var projection = map.getView().getProjection();
            var projCode = map.getView().getProjection().getCode();
            var cfg;

            var attributions = config.attribution ?
                config.attribution : undefined;

            if (sourceType === 'Vector') {

                // The wfscluster type expects a geoserver view similar
                // as described on https://wiki.intranet.terrestris.de/doku.php
                // ?id=clustering
                //
                // There is currently no way in ol to request features on
                // every extent change, so we need to handle it ourselves with
                // map listeners, which happens in the cluster plugin
                if (config.type === 'WFSCluster') {
                    cfg = {
                        attributions: attributions
                    };
                } else {
                    cfg = {
                        attributions: attributions,
                        loader: function(extent/*, resolution, projection */) {
                            // eslint-disable-next-line consistent-this
                            var vectorSource = this;
                            var extraParams = {};

                            var finalParams = Ext.apply({
                                service: 'WFS',
                                version: '1.1.0',
                                request: 'GetFeature',
                                outputFormat: 'application/json',
                                typeName: config.layers,
                                srsname: projCode,
                                bbox: extent.join(',') + ',' + projCode
                            }, extraParams || {});

                            Ext.Ajax.request({
                                url: config.url,
                                method: 'GET',
                                params: finalParams,
                                success: function(response) {
                                    var format = new ol.format.GeoJSON();
                                    var features = format.readFeatures(
                                        response.responseText
                                    );
                                    vectorSource.addFeatures(features);
                                },
                                failure: function(response) {
                                    var msg = 'server-side failure with ' +
                                        'status code ' + response.status;
                                    Ext.log.info(msg);
                                }
                            });

                        },
                        strategy: ol.loadingstrategy.tile(
                            ol.tilegrid.createXYZ({
                                maxZoom: 28
                            })
                        )
                    };
                }
            } else if (sourceType === 'TileWMS' ||
                       sourceType === 'WMS' ||
                       sourceType === 'ImageWMS' ||
                       sourceType === 'XYZ') {

                cfg = {
                    url: config.url,
                    crossOrigin: config.crossOrigin,
                    attributions: attributions,
                    params: {
                        LAYERS: config.layers,
                        TRANSPARENT: config.transparent || true,
                        VERSION: config.version || '1.1.1'
                    }
                };

                // set a tilegrid if needed
                if (me.appContext &&
                    me.appContext.mapConfig &&
                    me.appContext.mapConfig.resolutions &&
                    (config.type === 'TileWMS' || config.type === 'XYZ') &&
                    config.tileGrid === undefined) {
                    cfg.tileGrid = new ol.tilegrid.TileGrid({
                        extent: map.getView().getProjection().getExtent(),
                        resolutions: me.convertStringToNumericArray(
                            'float', me.appContext.mapConfig.resolutions)
                    });
                }

                if ((config.type === 'TileWMS' ||
                     config.type === 'WMS' ||
                     config.type === 'XYZ') && config.tiled) {
                    cfg.params.TILED = true;
                }

            } else if (sourceType === 'WMTS') {
                var tileGrid;
                // we simply assume it is a worldwide layer
                var origin = ol.extent.getTopLeft(projection.getExtent());
                var projectionExtent = projection.getExtent();
                var size = ol.extent.getWidth(projectionExtent) / 256;
                var resolutions = new Array(14);
                var matrixIds = new Array(14);
                for (var z = 0; z < 14; ++z) {
                    // generate resolutions and matrixIds arrays for this
                    // WMTS
                    resolutions[z] = size / Math.pow(2, z);
                    matrixIds[z] = z;
                }
                tileGrid = new ol.tilegrid.WMTS({
                    origin: origin,
                    resolutions: resolutions,
                    matrixIds: matrixIds
                });

                cfg = {
                    url: config.url,
                    layer: config.layers,
                    attributions: attributions,
                    matrixSet: config.tilematrixset,
                    format: config.format,
                    projection: projection,
                    tileGrid: tileGrid,
                    style: config.style
                };
            }

            return new ol.source[sourceType](cfg);

        },

        /**
         * Returns an OpenLayers layer for the passed configuration, type and
         * source.
         *
         * @param {Object} layer The layer configuration.
         * @param {String} layerType The layertype.
         * @param {ol.source.Source} source The layer source.
         * @return {ol.layer.Base} The created layer.
         */
        getLayerForType: function(layer, layerType, source) {

            var olLayerConfig = {
                name: layer.name || 'No Name given',
                legendUrl: layer.legendUrl || (this.autocreateLegends ?
                    this.generateLegendUrl(layer) : null),
                legendHeight: layer.legendHeight || null,
                minResolution: layer.minResolution || undefined,
                maxResolution: layer.maxResolution || undefined,
                opacity: layer.opacity || 1,
                visible: (layer.visibility === false) ? false : true,
                treeColor: layer.treeColor,
                routingId: layer.id || null,
                olStyle: layer.olStyle || null,
                // TODO we should get rid of `topic`
                topic: layer.topic || layer.hoverField || null,
                source: source,
                type: layer.type,
                featureType: layer.layers
            };

            // We don't require the hover plugin class to allow for smaller
            // builds
            if ('plugin' in BasiGX && 'Hover' in BasiGX.plugin) {
                var hoverCls = BasiGX.plugin.Hover;
                var hoverableProp = hoverCls.LAYER_HOVERABLE_PROPERTY_NAME;
                var hoverfieldProp = hoverCls.LAYER_HOVERFIELD_PROPERTY_NAME;
                var shallHover = false;
                if (hoverableProp in layer) {
                    shallHover = layer[hoverableProp];
                } else {
                    shallHover = !!layer[hoverfieldProp];
                }
                olLayerConfig[hoverableProp] = shallHover;
                olLayerConfig[hoverfieldProp] = layer[hoverfieldProp];
            }

            // TODO Refactor ... Do we need an icon or a color...
            if (layer.type === 'WFSCluster') {
                if (!layer.clusterColorString) {
                    var r = Math.round(Math.random() * 255, 10).toString();
                    var g = Math.round(Math.random() * 255, 10).toString();
                    var b = Math.round(Math.random() * 255, 10).toString();
                    olLayerConfig.clusterColorString =
                        'rgba(' + r + ',' + g + ',' + b + ',0.5)';
                } else {
                    olLayerConfig.clusterColorString = layer.clusterColorString;
                }
                olLayerConfig.icon = layer.icon;
            }

            // apply custom params of layer from appContext
            if (layer.customParams) {
                Ext.applyIf(olLayerConfig, layer.customParams);
            }

            return new ol.layer[layerType](olLayerConfig);
        },

        /**
         * Creates an ol layer group.
         *
         * @param {Object} node The node which has been identified as group
         * @return {ol.layer.Group} An ol-layer group
         */
        createFolder: function(node) {
            return new ol.layer.Group({
                name: node.name,
                visible: node.checked ? node.checked : false
            });
        },

        /**
         * This method gets called internally by the setupMap method, so there
         * should be no need to call this directly
         *
         * @param {Object} context The context holding the layers config
         */
        getLayersArray: function(context) {
            var me = this;
            var layerConfig;
            var layerTreeConfig;

            if (!context || !context.data || !context.data.merge ||
                !context.data.merge.mapLayers) {
                Ext.log.warn('Invalid context given to configParser!');
                return;
            }

            layerConfig = context.data.merge.mapLayers;
            layerTreeConfig = Ext.decode(context.data.merge.layerTreeConfig);

            if (!Ext.isEmpty(layerTreeConfig)) {
                // we have a SHOGun context and need to iterate through
                // the treeconfig to get access to folders and special
                // layer information
                me.createLayersArrayFromShogunContext(
                    layerTreeConfig, layerConfig
                );
            } else {
                me.createLayersArray(layerConfig);
            }
        },

        /**
         * Method sets up an layer and grouplayer collection for an ol map
         *
         * @param {Object} layerConfig The layerconfig object
         * @param {ol.layer.Group} parent The parent to which we may append
         */
        createLayersArray: function(layerConfig, parent) {
            var me = this;

            Ext.each(layerConfig, function(node) {

                if (node.type === 'Folder') {
                    var folder = me.createFolder(node);

                    if (parent) {
                        parent.getLayers().push(folder);
                    } else {
                        me.layerArray.push(folder);
                    }

                    // create child nodes if necessary
                    if (node.layers && node.layers.length > 0) {
                        me.createLayersArray(node.layers, folder);
                    }

                } else {
                    if (parent) {
                        parent.getLayers().push(me.createLayer(node));
                    } else {
                        me.layerArray.push(me.createLayer(node));
                    }
                }
            }, me);
        },

        /**
         * Method sets up an layer and grouplayer collection for an ol map
         * based on an SHOGun application Context
         *
         * @param {Object} treeCfg The layerTreeConfig object
         * @param {Object} layerCfg The layerconfig object
         * @param {ol.layer.Group} group The parent to which we may append
         */
        createLayersArrayFromShogunContext: function(treeCfg, layerCfg, group) {
            var me = this;

            Ext.each(treeCfg, function(node) {

                //handling the rootnode first
                if (node.parentId === null && node.children) {
                    me.createLayersArrayFromShogunContext(
                        node.children, layerCfg
                    );
                } else if (node.leaf === false) {
                    // handling folders
                    var folder = me.createFolder(node);
                    folder.set('expanded', node.expanded);

                    if (group) {
                        group.getLayers().push(folder);
                        folder.set('parentFolder', group);
                    } else {
                        me.layerArray.push(folder);
                    }

                    // create child nodes if necessary
                    if (node.children && node.children.length > 0) {
                        me.createLayersArrayFromShogunContext(
                            node.children.reverse(), layerCfg, folder);
                    }

                } else {

                    // handling layers
                    // get node from config by its id
                    var mergedNode = me.getNodeFromConfigById(
                        node.mapLayerId, layerCfg
                    );
                    // adding properties from treeConfig to node from
                    // layerconfig
                    mergedNode.visibility = node.checked;
                    mergedNode.expanded = node.expanded;

                    if (group) {
                        group.getLayers().getArray().push(
                            me.createLayer(mergedNode)
                        );
                        if (node.checked) {
                            group.set('visible', true);
                            var nextParent = group.get('parentFolder');
                            while (nextParent) {
                                nextParent.set('visible', true);
                                nextParent = nextParent.get('parentFolder');
                            }
                        }
                    } else {
                        me.layerArray.push(me.createLayer(mergedNode));
                    }
                }
            }, me);
        },

        /**
         * Method retrieves a layerconfig object by the given id.
         *
         * @param {Number} mapLayerId The mapLayerId.
         * @param {Array} layerConfig a list of layer confgs to search in.
         * @return {Object} The layer object that has been found.
         */
        getNodeFromConfigById: function(mapLayerId, layerConfig) {
            var match;
            Ext.each(layerConfig, function(layer) {
                if (layer.id === mapLayerId) {
                    match = layer;
                    return false;
                }
            });
            return match;
        },

        /**
         * Method turns a comma separated string into an array containing
         * integers or floats. If passed an array, parse{Int,Float} will be
         * called on each item.
         *
         * @param {String} type The type to convert to.
         * @param {String | Array} string The string to convert.
         * @return {Array} The parsed array.
         */
        convertStringToNumericArray: function(type, string) {
            if (Ext.isEmpty(string) || Ext.isEmpty(type)) {
                Ext.log.warn('Cannot convert string to numeric array. Passed ' +
                    'type was: ' + type + '; Passed string was: ' + string);
                return string;
            }
            if (Ext.isArray(string)) {
                var result = [];
                Ext.each(string, function(item) {
                    if (type === 'int') {
                        result.push(parseInt(item, 10));
                    } else if (type === 'float') {
                        result.push(parseFloat(item, 10));
                    }
                });
                return result;
            }
            var arr = [];
            Ext.each(string.split(','), function(part) {
                if (type === 'int') {
                    arr.push(parseInt(part, 10));
                } else if (type === 'float') {
                    arr.push(parseFloat(part, 10));
                }
            });
            return arr;
        },

        /**
         * Method creates a hopefully valid getlegendgraphic request for the
         * given layer.
         *
         * @param {Object} layer A layer configuration.
         * @return {String} The generated legend URL.
         */
        generateLegendUrl: function(layer) {
            var url = layer.url;
            url += '?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&';
            url += 'FORMAT=image%2Fpng&TRANSPARENT=TRUE&';
            url += 'LAYER=' + layer.layers;
            // HEIGHT=128&WIDTH=40& could be added.
            return url;
        }
    }
});
