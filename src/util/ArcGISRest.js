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
         * Creates an olLayer from an ArcGISRest layer config.
         *
         * @param {object} layerConfig The layer config to base the olLayer on.
         * @param {object} layerConfig.service The service config info.
         * @param {string} layerConfig.service.type The service type.
         * @param {string} layerConfig.service.name The service name.
         * @param {string} layerConfig.url The service url.
         * @param {boolean} useDefaultHeader Whether to use the default
         * Xhr header.
         * @return {Ext.Promise} A promise containing the olLayer.
         */
        createOlLayerFromArcGISRest: function(layerConfig, useDefaultHeader) {
            var service = layerConfig.service;
            var url = layerConfig.url;
            var serviceUrl = BasiGX.util.ArcGISRest.getArcGISRestRootUrl(url);
            serviceUrl = [serviceUrl, service.name, service.type].join('/');
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
                switch(service.type) {
                    case 'ImageServer':
                    case 'MapServer':
                        var source = new ol.source.TileArcGISRest({
                            url: serviceUrl,
                            projection: 'EPSG:' +
                                serviceInfo.spatialReference.wkid
                        });
                        layer = new ol.layer.Tile({
                            source: source,
                            name: service.name,
                            topic: true
                        });
                        break;
                    case 'FeatureServer':
                        // FeatureServers can only be requested
                        // for single layers in a service.
                        Ext.log.info('ArcGISRest FeatureServer is ' +
                            'currently not supported.');
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
