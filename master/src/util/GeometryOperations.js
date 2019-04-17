/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * Utility class containing static methods for geometry operations.
 *
 * @class BasiGX.util.GeometryOperations
 */
Ext.define('BasiGX.util.GeometryOperations', {

    statics: {

        /**
         * The circle geometries are not supported by the WKT format, so it
         * can't be used for modify iterations.

         * Since OpenLayers still doesn't support it
         * (s. also https://github.com/openlayers/ol3/issues/3777) we need to
         * transform the drawn circle to the approximate regular polygon with
         * given circle geometry.
         *
         * The passed collection is modified in place.
         *
         * @param {ol.Collection} features The collection of features to
         *     transform to features with a `ol.geom.Polygon` geometry. This
         *     collection is modified in place.
         */
        translateCircleToPolygon: function(features) {
            Ext.each(features.getArray(), function(f) {
                if (f.getGeometry().getType() === "Circle") {
                    var geom = f.getGeometry();
                    var newGeom = new ol.geom.Polygon.fromCircle(geom);
                    var newFeat = new ol.Feature(newGeom);

                    features.remove(f);
                    features.insertAt(
                        features.getLength(),
                        newFeat
                    );
                }
            });
        },

        /**
         * Computes circle feature radius depending on given center and the
         * second coordinate as distance from the circle center to the vertices.
         *
         * @param {ol.Coordinate} start The start coordinates as array (lat/lon
         *     or x/y).
         * @param {ol.Coordinate} end The end coordinates as array (lat/lon or
         *     x/y).
         * @return {Number} The radius of a circle with center at `start` going
         *     through `end`.
         */
        computeCircleRadius: function(start, end) {
            var deltaX = end[0] - start[0];
            var deltaY = end[1] - start[1];
            return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        }
    }

});
