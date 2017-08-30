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
 * Caching Util
 *
 * Some methods that may be helpful in case of caching, e.g. with GeoWebCache
 *
 * @class BasiGX.util.Caching
 */
Ext.define('BasiGX.util.Caching', {

    requires: [
        'BasiGX.util.Map'
    ],

    statics: {
        /**
         * Call this function from the console (in one of your applications)
         * and it returns config information that may be used to quickly setup a
         * matching GWC gridset in the GeoServer.
         *
         * Note: If the extent is not passed to this function, the ol.view of
         * the ol.map should have explicitly set an 'extent' property!
         *
         * @param {Number} tileSize The tile size in pixels
         * @param {Array} extent Optional: The extent to use for the gridSet
         * @return {Object} An object with information to quickly setup a GWC
         *     gridset in GeoServer.
         */
        getGeoWebCacheConfig: function(tileSize, extent) {
            var me = this;
            var map = BasiGX.util.Map.getMapComponent().getMap();
            var mapView = map.getView();

            if (Ext.isEmpty(tileSize)) {
                Ext.Logger.error('Tile size must be provided!');
                return;
            }

            if (Ext.isEmpty(extent)) {
                // if extent has not been passed: try to get it from the ol.view
                extent = mapView.get('extent');

                if (Ext.isEmpty(extent)) {
                    Ext.Logger.warn('Extent should be set explicitly ' +
                        'on the ol.view of the map, if it is not passed ' +
                        'to this function.');
                }
            }

            if (!Ext.isEmpty(extent) && !Ext.isArray(extent)) {
                Ext.Logger.warn('Extent should be an array!');
            }

            var projection = mapView.getProjection().getCode();
            var resolutions = mapView.getResolutions();
            var maxResolution = Ext.Array.max(resolutions);

            var tileOrigin = me.getTileOrigin(tileSize, maxResolution, extent);

            var gwcConfig = {
                projection: projection,
                resolutions: resolutions,
                extent: extent,
                tileOrigin: tileOrigin
            };

            return gwcConfig;
        },

        /**
         * Computes the tile origin (top left) for a given extent
         * (lower left/upper right bbox), maxResolution and tileSize that
         * can be set as the origin on a ol.tilegrid.TileGrid instance to
         * match a GWC gridset configured in a GeoServer. GetMap requests
         * should use the parameter tiled=true to make use of the cache.
         *
         * @param {Number} tileSize The tile size in pixels
         * @param {Number} maxResolution The max resolution
         * @param {Array} extent The extent to use for the gridSet
         * @return {Array} The array with two elements representing the
         *     tileOrigin coordinate.
         */
        getTileOrigin: function(tileSize, maxResolution, extent) {
            if (Ext.isEmpty(tileSize) || Ext.isEmpty(maxResolution) ||
                Ext.isEmpty(extent)) {
                Ext.Logger.error('Tile size, max resolution and extent ' +
                    'must be provided!');
            }

            if (!Ext.isArray(extent)) {
                Ext.Logger.error('Extent must be an array!');
            }

            var minX = extent[0];
            var minY = extent[1];
            var maxY = extent[3];

            // height of the extent
            var extentHeight = maxY - minY;

            // height of one tile at max resolution in the
            // unit of the underlying projection
            var tileHeight = tileSize * maxResolution;

            // the minimum number of tiles that are required to fully
            // fit the given extent (from bottom to top)
            var minNrOfTiles = Math.ceil(extentHeight / tileHeight);

            // finally compute the tile origin
            var tileOriginY = minY + (minNrOfTiles * tileHeight);

            return [minX, tileOriginY];
        }
    }
});
