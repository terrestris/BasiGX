/* Copyright (c) 2016-present terrestris GmbH & Co. KG
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
 * @class BasiGX.util.WFST
 */
Ext.define('BasiGX.util.WFST', {

    requires: [
        'BasiGX.util.Map',
        'BasiGX.util.CSRF'
    ],

    statics: {

        /**
         * The duration for a feature lock in minutes
         */
        lockTime: 1,

        /**
         * Starts a WFS Transaction for the given feature arrays.
         *
         * @param {Object} opts Options for the transaction.
         * @param {ol.layer} opts.layer The layer the features come from.
         * @param {Array} opts.wfstInserts The Array holding
         *  the features to insert.
         *
         * @param {Array} opts.wfstUpdates The Array holding
         *  the features to update.
         *
         * @param {Array} opts.wfstDeletes The Array holding
         *  the features to delete.
         *
         * @param {String} opts.lockId The id of the current feature lock.
         * @return {Ext.Promise} Promise resolving with transactionResponse.
         */
        transact: function(opts) {
            return new Ext.Promise(function(resolve, reject) {
                var layerProps = opts.layer.getProperties();
                var format = new ol.format.WFS;
                var map = BasiGX.util.Map.getMapComponent().map;
                var projection = map.getView().getProjection().getCode();
                var url = layerProps.wfsBaseUrl;
                if (!Ext.isDefined(url) || Ext.isEmpty(url)) {
                    return reject('No wfsBaseUrl defined.');
                }

                var qualifiedLayerName = layerProps.originalLayerName;
                var featurePrefix = qualifiedLayerName.split(':')[0];
                var featureType = qualifiedLayerName.split(':')[1];
                var featureNs = layerProps.namespace;

                var transactionOpts = {
                    featureNS: featureNs,
                    featurePrefix: featurePrefix,
                    featureType: featureType,
                    srsName: projection
                };
                var xml = format.writeTransaction(
                    opts.wfstInserts,
                    opts.wfstUpdates,
                    opts.wfstDeletes,
                    transactionOpts
                );
                /* eslint-disable */
                var serializer = new XMLSerializer();
                /* eslint-enable */
                xml = serializer.serializeToString(xml);

                // override the geometryname, as its hardcoded
                // through OpenLayers to `geometry`
                var gname = layerProps.geomField;
                xml = xml.replace(
                    /<Property><Name>geometry<\/Name>/g,
                    '<Property><Name>' + gname + '</Name>');
                xml = xml.replace(/<geometry>/g, '<' + gname + '>');
                xml = xml.replace(/<\/geometry>/g, '</' + gname + '>');
                // insert the lockId, if available
                if (opts.lockId) {
                    // TODO fails on FF, XML seems to be serialized differently
                    /* eslint-disable */
                    xml = xml.replace(/(http:\/\/schemas.opengis.net\/wfs\/1.1.0\/wfs.xsd">)/g,
                        function($1) {
                            return $1 + '<LockId>' + opts.lockId + '</LockId>';
                        });
                    /* eslint-enable */
                    xml = xml.replace('XMLSchema-instance">',
                        'XMLSchema-instance"><LockId>' +
                        opts.lockId + '</LockId>');
                }

                Ext.Ajax.request({
                    url: url,
                    xmlData: xml,
                    headers: BasiGX.util.CSRF.getHeader(),
                    method: 'POST',
                    success: function(xhr) {
                        var res = xhr.responseText;
                        /* eslint-disable */
                        var transactionResponse = format.readTransactionResponse(xhr.responseText);
                        /* eslint-enable */
                        if (Ext.isEmpty(transactionResponse) ||
                            res.indexOf('<ows:ExceptionText>') >= 0) {
                            var msg = 'Unspecified error occured.';
                            if (res.indexOf('<ows:ExceptionText>') >= 0) {
                                msg = res.split('<ows:ExceptionText>')[1].
                                    split('</ows:ExceptionText>')[0];
                            }
                            return reject(msg);
                        }

                        var result = transactionResponse.transactionSummary;
                        if ((result.totalDeleted && result.totalDeleted > 0) ||
                            /* eslint-disable */
                            (result.totalInserted && result.totalInserted > 0) ||
                            /* eslint-enable */
                            (result.totalUpdated && result.totalUpdated > 0)) {
                            // TODO: layer needs to be transformed
                            //       to real WFS layer
                            opts.layer.changed();
                        }
                        resolve(transactionResponse);
                    },
                    failure: function(xhr) {
                        var res = xhr.responseText;
                        /* eslint-disable */
                        var transactionResponse = format.readTransactionResponse(res);
                        /* eslint-enable */
                        var msg = 'Unspecified error occured.' +
                            transactionResponse;
                        if (res.indexOf('<ows:ExceptionText>') >= 0) {
                            msg = res.split('<ows:ExceptionText>')[1].
                                split('</ows:ExceptionText>')[0];
                        }
                        reject(msg);
                    }
                });
            });
        },

        /**
         * Issues a WFS-T LockFeature
         *
         * @param {ol.layer} layer The layer the lock should be aquired for
         * @return {Ext.Promise} The AJAX Request as a promise
         */
        lockFeatures: function(layer) {
            var layerProps = layer.getProperties();
            var qualifiedLayerName = layerProps.originalLayerName;
            var layerName = qualifiedLayerName.split(':')[1];

            var nsUri = layerProps.namespace;
            var url = layerProps.wfsBaseUrl;

            if (!Ext.isDefined(url) || Ext.isEmpty(url)) {
                return new Ext.Promise(function(resolve, reject){
                    reject('No url specified.');
                });
            }

            var xmlTemplate = '<LockFeature ' +
                'xmlns="http://www.opengis.net/wfs" ' +
                'xmlns:ns="{0}" ' +
                'service="WFS" ' +
                'expiry="' + BasiGX.util.WFST.lockTime + '" ' +
                'version="1.1.0">' +
                '<Lock typeName="ns:{1}"/>' +
                '</LockFeature>';
            var xml = Ext.String.format(xmlTemplate, nsUri, layerName);
            return Ext.Ajax.request({
                url: url,
                xmlData: xml,
                method: 'POST',
                headers: BasiGX.util.CSRF.getHeader()
            });
        },

        /**
         * Handles the response from the LockFeature request.
         *
         * @param {Object} response The XHR response of the request
         * @return {Ext.Promise} A promise resolving with a lockId.
         */
        handleLockFeaturesResponse: function(response) {
            var resText = response.responseText;
            var lockId;
            if (resText.indexOf('<wfs:LockId>') >= 0) {
                lockId = resText.split(
                    '<wfs:LockId>')[1].split('</wfs:LockId>')[0];
                Ext.log.info('WFS-T Lock aquired with id ' + lockId +
                    ', will time out in ' + BasiGX.util.WFST.lockTime +
                    ' minutes'
                );
            }
            return new Ext.Promise(function(resolve, reject) {
                if (lockId) {
                    resolve(lockId);
                } else {
                    reject();
                }
            });
        }

    }
});
