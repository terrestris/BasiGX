/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
         * @param {ol.View} [view] The OpenLayers map view. If not passed it
         *     will be guessed.
         * @param {Array<Number>} [tileSize] The tile size in pixels. If not
         *     passed we'll assume a 256×256 pixel tile size.
         * @param {Array} [extent] The extent to use for the gridSet. If not
         *     passed, we'll take the validity extent of the projection of the
         *     view.
         * @return {Object} An object with information to quickly setup a GWC
         *     gridset in GeoServer.
         */
        getGeoWebCacheConfig: function(view, tileSize, extent) {
            var staticMe = BasiGX.util.Caching;
            var projection;
            view = staticMe.sanitizeView(view);
            if (!view) {
                Ext.Logger.warn('Failed to guess the ol.View');
                return;
            }
            projection = view.getProjection();
            tileSize = staticMe.sanitizeTileSize(tileSize);
            extent = staticMe.sanitizeExtent(extent, view);
            if (!extent) {
                Ext.Logger.warn('Failed to determine an extent');
                return;
            }
            var resolutions = view.getResolutions();
            var maxResolution = view.getMaxResolution();
            if (!maxResolution && resolutions) {
                maxResolution = Ext.Array.max(resolutions);
            }
            var tileOrigin = staticMe.getTileOrigin(
                tileSize, maxResolution, extent
            );
            var gwcConfig = {
                projection: projection.getCode(),
                resolutions: resolutions,
                maxResolution: maxResolution,
                extent: extent,
                tileOrigin: tileOrigin
            };

            return gwcConfig;
        },

        /**
         * Computes an extent that completely covers the given extent
         * for tiles of maxResolution and with the specified tileSize.
         *
         *     +------------------+
         *     |                  | computed extent
         *     |----------------+ |
         *     |                | |
         *     |     passed     | |
         *     |     extent     | |
         *     |                | |
         *     +----------------+-+
         *
         * @param {Number|Array<Number>} tileSize The tile size in pixels. Can
         *     be passed as number or as array of two numbers.
         * @param {Number} maxResolution The max resolution of the view.
         * @param {Array} extent The extent to use for the gridset.
         * @return {Array} The array with two elements representing the
         *     tileOrigin coordinate (the upper left coordinate of the
         *     covering extent).
         */
        getExtentOfCoveringTileGrid: function(tileSize, maxResolution, extent) {
            var staticMe = BasiGX.util.Caching;
            tileSize = staticMe.sanitizeTileSize(tileSize);
            extent = staticMe.sanitizeExtent(extent);
            if (!tileSize || !maxResolution || !extent) {
                Ext.Logger.warn('Tile size, max resolution and extent ' +
                    'must be provided');
                return;
            }

            var minX = extent[0];
            var minY = extent[1];
            var extentWidth = ol.extent.getWidth(extent);
            var extentHeight = ol.extent.getHeight(extent);

            // width/height of one tile at max resolution in the
            // unit of the underlying projection
            var tileWidth = tileSize[0] * maxResolution;
            var tileHeight = tileSize[1] * maxResolution;

            // the minimum number of tiles that are required to fully
            // cover the given extent in x- or y-direction
            var minNumTilesX = Math.ceil(extentWidth / tileWidth);
            var minNumTilesY = Math.ceil(extentHeight / tileHeight);

            // finally compute the max x and y values
            var maxX = minX + (minNumTilesX * tileWidth);
            var maxY = minY + (minNumTilesY * tileHeight);

            return [minX, minY, maxX, maxY];
        },

        /**
         * Computes the tile origin (top left) for a given extent
         * (lower left/upper right bbox), maxResolution and tileSize that
         * can be set as the origin on a ol.tilegrid.TileGrid instance to
         * match a GWC gridset configured in a GeoServer. GetMap requests
         * should use the parameter tiled=true to make use of the cache.
         *
         *     Top-left
         *     X------------------+
         *     |                  |
         *     |----------------+ |
         *     |                | |
         *     |     passed     | |
         *     |     extent     | |
         *     |                | |
         *     +----------------+-+
         *
         * @param {Number|Array<Number>} tileSize The tile size in pixels. Can
         *     be passed as number or as array of two numbers.
         * @param {Number} maxResolution The max resolution of the view.
         * @param {Array} extent The extent to use for the gridset.
         * @return {Array} The array with two elements representing the
         *     tileOrigin coordinate (the upper left coordinate of the
         *     covering extent).
         */
        getTileOrigin: function(tileSize, maxResolution, extent) {
            var staticMe = BasiGX.util.Caching;
            var coveringExtent = staticMe.getExtentOfCoveringTileGrid(
                tileSize, maxResolution, extent
            );
            if (!coveringExtent) {
                Ext.Logger.warn(
                    'Failed to determine covering extent and origin'
                );
                return;
            }
            return ol.extent.getTopLeft(coveringExtent);
        },

        /**
         * Sanitizes the passed view. If a falsy value is passed or the passed
         * view is not an instance of `ol.View`, guess the map component on the
         * page and return the view of its map.
         *
         * @param {ol.View} [view] The OpenLayers map view. If not passed it
         *     will be guessed.
         * @return {ol.View} A view or undefined if the view could not be
         *     sanitized.
         * @private
         */
        sanitizeView: function(view) {
            if (!view || !(view instanceof ol.View)) {
                Ext.Logger.info('No or unexpected view passed,' +
                    ' guessing ol.View now');
                var mapComp = BasiGX.util.Map.getMapComponent();
                var map = mapComp && mapComp.getMap();
                view = map && map.getView();
                if (!view) {
                    Ext.Logger.warn('Failed to guess the ol.View');
                    return;
                }
            }
            return view;
        },

        /**
         * Sanitizes the passed tile size. If a number is passed, this method
         * will assume a rectangular tile and return an array of `[in, in]`. If
         * an array of two numbers is passed, the tile size will be returned
         * unchanged. Anything else will result in the default tile size of
         * `[256, 256]` being returned.
         *
         * @param {Number|Array<Number>} [tileSize] The tile size in pixels. Can
         *     be passed as number or as array of two numbers.
         * @return {Array<Number>} The sanitized tile size as array of two
         *     numbers or `[256, 256]` if we received something unexpected.
         * @private
         */
        sanitizeTileSize: function(tileSize) {
            var msg;
            if (Ext.isNumber(tileSize)) {
                msg = 'Parameter tileSize passed as number,' +
                    ' assuming rectangular tilesize of [{0}, {0}] now';
                Ext.Logger.info(Ext.String.format(msg, tileSize));
                tileSize = [tileSize, tileSize];
            }
            if (!Ext.isArray(tileSize) ||
                    !Ext.isNumber(tileSize[0]) || !Ext.isNumber(tileSize[1])) {
                Ext.Logger.info('No or unexpected tileSize passed,' +
                    ' defaulting to [256, 256] now');
                tileSize = [256, 256];
            }
            return tileSize;
        },

        /**
         * Sanitizes the passed extent, potentially taking into account the
         * passed `ol.View`. A valid extent (minX, minY, maxX, maxY) will
         * be returned unchanged. When the passed extent is falsy, the view
         * will be queried for a property `extent`, and the checking of the
         * validity will use this extent. If we consider the extent invalid,
         * the view will be asked to provide us the validity extent of its
         * projection, and we'll use that.
         *
         * @param {Array<Number>} [extent] The extent we want to sanitize.
         * @param {ol.View} [view] Will be used to in case the passed extent is
         *     falsy or otherwise unexpected. First we check if there is a
         *     property 'extent' on the view, and finally we'll return the
         *     validity extent from the projection of the view. Please note that
         *     this might be `undefined` as well.
         * @return {Array<Number>} The normalized extent or `undefined`.
         * @private
         */
        sanitizeExtent: function(extent, view) {
            // some views might have this explicitly set
            extent = extent || (view && view.get('extent'));
            if (!Ext.isArray(extent) ||
                    !Ext.isNumber(extent[0]) || !Ext.isNumber(extent[1]) ||
                    !Ext.isNumber(extent[2]) || !Ext.isNumber(extent[3]) ||
                    ol.extent.getWidth(extent) <= 0 ||
                    ol.extent.getHeight(extent) <= 0) {
                var msg = 'No or unexpected extent passed, ';
                var projection = view && view.getProjection();
                if (projection) {
                    msg += 'defaulting to validity extent of view projection';
                    Ext.Logger.info(msg);
                    extent = projection.getExtent();
                } else {
                    msg += 'and view cannot be used to derive one';
                    Ext.Logger.info(msg);
                    return;
                }
            }
            return extent;
        }

    }
});
