/* Copyright (c) 2022-present terrestris GmbH & Co. KG
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
 * ArcGISRest Util
 *
 * Some methods to work with ArcGISRest
 *
 * @class BasiGX.util.ArcGISRest
 */
Ext.define('BasiGX.util.ArcGISRest', {

    requires: [
        'BasiGX.util.Url'
    ],

    statics: {

        /**
         * Check if a url is an ArcGISRest URL.
         *
         * ArcGISRest URL must contain a path called '/services/'.
         *
         * @param {string} url The url to check.
         * @return {boolean} True, if url is ArcGISRest URL. False otherwise.
         */
        isArcGISRestUrl: function(url) {
            var urlObj = new URL(url);
            var parts = urlObj.pathname.split('/');
            return parts.indexOf('services') > -1;
        },

        /**
         * Get the root URL of the ArcGISRest service.
         *
         * @param {string} url The URL to get the root URL from.
         * @return {string} The root URL.
         */
        getArcGISRestRootUrl: function(url) {
            if (!BasiGX.util.ArcGISRest.isArcGISRestUrl(url)) {
                return;
            }
            var urlObj = new URL(url);
            var parts = urlObj.pathname.split('/');
            var serviceIndex = parts.indexOf('services');
            var baseParts = parts.slice(0, serviceIndex + 1);
            var basePath = baseParts.join('/');

            return urlObj.origin + basePath;
        },

        /**
         * Creates the URL for a FeatureServer request.
         *
         * @param {string} serviceUrl The URL of the service.
         * @param {string} serverName The name of the FeatureServer.
         * @param {string} format The output format.
         * @return {string} The URL to the FeatureServer.
         */
        createFeatureServerUrl: function(serviceUrl, serverName, format) {
            if (!BasiGX.util.ArcGISRest.isArcGISRestUrl(serviceUrl)) {
                return;
            }
            var urlObj = new URL(serviceUrl);
            var parts = urlObj.pathname.split('/');
            parts.push(serverName);
            parts.push('FeatureServer');
            var path = parts.join('/');

            var url = urlObj.origin + path;
            if (format) {
                url = BasiGX.util.Url.setQueryParam(url, 'f', format);
            }

            return url;
        },

        createMapServerUrl: function(serviceUrl, serverName, format) {
            // TODO refactor with createFeatureServerUrl if code works
            if (!BasiGX.util.ArcGISRest.isArcGISRestUrl(serviceUrl)) {
                return;
            }
            var urlObj = new URL(serviceUrl);
            var parts = urlObj.pathname.split('/');
            if (parts[parts.length - 1] === '') {
                parts.pop();
            }
            parts.pop();
            parts.push(serverName);
            parts.push('MapServer');
            var path = parts.join('/');

            var url = urlObj.origin + path;
            if (format) {
                url = BasiGX.util.Url.setQueryParam(url, 'f', format);
            }

            return url;
        },

        /**
         * Creates a query URL for a layer of a FeatureServer.
         *
         * @param {string} serviceUrl The URL of the service.
         * @param {number} layerId The id of the layer in the FeatureServer.
         * @param {string} format The output format.
         * @param {string} filter The filter condition.
         * @return {string} The query URL.
         */
        createFeatureServerQueryUrl: function(
            serviceUrl, layerId, format, filter
        ) {
            if (!BasiGX.util.ArcGISRest.isArcGISRestUrl(serviceUrl)) {
                return;
            }
            var urlObj = new URL(serviceUrl);
            var parts = urlObj.pathname.split('/');
            parts.push(layerId);
            parts.push('query');
            var path = parts.join('/');

            var url = urlObj.origin + path;
            if (format) {
                url = BasiGX.util.Url.setQueryParam(url, 'f', format);
            }
            // The query endpoint has a required 'where' parameter. In
            // order to get all features, we apply a where-clause that
            // always returns true. This behavior can be overwritten
            // by specifying a 'filter' argument.
            var filterToUse = '1=1';
            if (filter) {
                filterToUse = filter;
            }
            url = BasiGX.util.Url.setQueryParam(url, 'where', filterToUse);

            return url;
        },

        /**
         * Creates an olLayer from an ArcGISRest layer config.
         *
         * @param {object} layerConfig The layer config to base the olLayer on.
         * @param {object} layerConfig.service The service config info.
         * @param {string} layerConfig.service.type The service type.
         * @param {string} layerConfig.service.name The service name.
         * @param {string} layerConfig.url The service url.
         * @param {object} layerConfig.layer (optional) The layer config of
         * a FeatureServer layer. Mandatory for layers of type Feature Server.
         * @param {number} layerConfig.layer.id The id of a FeatureServer layer.
         * @param {string} layerConfig.layer.name The name of a FeatureServer
         *
         * TODO: add sublayers
         *
         * layer.
         * @param {boolean} useDefaultHeader Whether to use the default
         * Xhr header.
         * @return {Ext.Promise} A promise containing the olLayer.
         */
        createOlLayerFromArcGISRest: function(layerConfig, useDefaultHeader) {
            var staticMe = BasiGX.util.ArcGISRest;
            var service = layerConfig.service;
            var url = layerConfig.url;
            var rootUrl = staticMe.getArcGISRestRootUrl(url);
            if (!rootUrl) {
                Ext.log.warn('Provided URL is not a valid ArcGISRest URL');
                return Ext.Promise.reject();
            }

            // collect all sublayer indexes the user has marked as visible
            var visibleLayerIndexes = [];
            layerConfig.subLayers.each(function(sublayer, layerIndex){
                if (sublayer.get('visibility')){
                   visibleLayerIndexes.push(layerIndex);
                }
            });

            var serviceUrl = [rootUrl, service.name, service.type].join('/');
            var onReject = function() {
                return Ext.Promise.reject();
            };
            return Ext.Ajax.request({
                url: BasiGX.util.Url.setQueryParam(serviceUrl, 'f', 'json'),
                method: 'GET',
                useDefaultXhrHeader: useDefaultHeader
            }, onReject).then(function(response) {
                var responseJson = JSON.parse(response.responseText);
                return Ext.Promise.resolve(responseJson);
            }, onReject).then(function(serviceInfo) {
                var layer = undefined;
                var source = undefined;
                switch(service.type) {
                    case 'ImageServer':
                    case 'MapServer':
                        source = new ol.source.TileArcGISRest({
                            url: serviceUrl,
                            projection: 'EPSG:' +
                                serviceInfo.spatialReference.wkid,
                            params: {
                                'LAYERS': 'show:' + visibleLayerIndexes.join(',')
                            }

                        });
                        layer = new ol.layer.Tile({
                            source: source,
                            name: service.name,
                            topic: true
                        });
                        break;
                    case 'FeatureServer':
                        var esrijsonFormat = new ol.format.EsriJSON();

                        var sourceUrl = staticMe.createFeatureServerQueryUrl(
                            url, layerConfig.layer.id, 'json');

                        source = new ol.source.Vector({
                            url: sourceUrl,
                            format: esrijsonFormat
                        });

                        layer = new ol.layer.Vector({
                            source: source,
                            name: service.name + '/' + layerConfig.layer.name,
                            topic: true
                        });
                        break;
                    default:
                        break;
                }
                return Ext.Promise.resolve(layer);
            }, function() {
                Ext.log.warn('Could not create olLayer from ArcGISRest.');
                return Ext.Promise.resolve();
            });
        }
    }
});
