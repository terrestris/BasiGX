/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class BasiGX.util.Projection
 */
Ext.define('BasiGX.util.Projection', {
    requires: [
        'BasiGX.store.Projections'
    ],

    statics: {

        /**
         * Fetch EPSG code definitions from https://epsg.io for given array
         * of EPSG codes
         *
         * @param {String[]} epsgCodeArray An array of EPSG code string,
         * e.g. ['EPSG:4326']
         * @return {Ext.Promise} An ExtJS promise resolving if all EPSG
         * information has successfully been fetched from https://epsg.io
         */
        fetchProj4jCrsDefinitions: function (epsgCodeArray) {
            if (!Ext.isArray(epsgCodeArray)) {
                return Ext.Promise.reject('No valid array of EPSG codes ' +
                    ' provided.');
            }
            var epsgIoBaseUrl = 'https://epsg.io/?q={0}&format=json';
            var projectionsStore = BasiGX.store.Projections;
            var epsgPromises = Ext.Array.map(Ext.Array.unique(epsgCodeArray), function (epsgCodeStr) {
                var epsgCode = epsgCodeStr.toUpperCase().replace('EPSG:', '');
                var existingDef = projectionsStore.getById(epsgCodeStr.toUpperCase());

                if (existingDef) {
                    return Ext.Promise.resolve(existingDef.getData());
                }

                return new Ext.Promise(function (resolve, reject) {
                    var epsgUrl = Ext.String.format(epsgIoBaseUrl, epsgCode);
                    Ext.Ajax.request({
                        url: epsgUrl,
                        useDefaultXhrHeader: false,
                        success: function (response) {
                            if (response && response.responseText &&
                                response.status === 200) {
                                var resultObj = Ext.decode(response.responseText);
                                resolve(resultObj.results[0]);
                            } else {
                                reject(response.status);
                            }
                        },
                        failure: function (response) {
                            reject(response.status);
                        }
                    });
                });
            });
            return Ext.Promise.all(epsgPromises);
        },

        /**
         * Register crs definitions
         * @param {Object[]} proj4jObjects An array of objects returned by
         * https://epsg.io which includes information on projection, in
         * particular the name, the unit and the proj4 definition
         */
        initProj4Definitions: function(proj4jObjects) {
            Ext.each(proj4jObjects, function(projectionDefinition) {
                var code = projectionDefinition.code;
                var proj4Def = projectionDefinition.proj4;
                // register to PRO4J
                var newProjCode = 'EPSG:' + code;
                proj4.defs(newProjCode, proj4Def);
            });
        }
    }

});
