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
 * @class BasiGX.util.Geometry
 */
Ext.define('BasiGX.util.Geometry', {

    statics: {

        /**
         * Check the features geometries' for equality and return the features
         * which have duplicates. Currently only works with two dimensional
         * geometries.
         *
         * @param {ol.Feature[]} features the features to check
         * @param {number} delta the delta for coordinate comparison, default
         * is 0.000001
         * @return {ol.Feature[]} the list of duplicates. Contains arrays
         * of pairwise features with duplicated geometries.
         */
        getGeometryDuplicates: function(features, delta) {
            var staticMe = BasiGX.util.Geometry;
            var duplicates = [];
            Ext.each(features, function(feat, idx) {
                Ext.each(features, function(other, otherIdx) {
                    if (otherIdx > idx) {
                        var g1 = feat.getGeometry();
                        var g2 = other.getGeometry();
                        if (staticMe.isDuplicate(g1, g2, delta)) {
                            duplicates.push([feat, other]);
                        }
                    }
                });
            });
            return duplicates;
        },

        /**
         * Checks whether two geometries are equal.
         *
         * @param {ol.geom.Geometry} geom1 the first geometry
         * @param {ol.geom.Geometry} geom2 the second geometry
         * @param {number} delta the delta for coordinate comparison, default is
         * 0.000001
         * @return {boolean} true if equal
         */
        isDuplicate: function(geom1, geom2, delta) {
            if (!delta) {
                delta = 0.000001;
            }
            var staticMe = BasiGX.util.Geometry;
            if (geom1.getType() !== geom2.getType()) {
                return false;
            }
            switch (geom1.getType()) {
                case 'Point':
                    return staticMe.isDuplicatePoint(geom1, geom2, delta);
                case 'LineString':
                    return staticMe.isDuplicateLineString(geom1, geom2, delta);
                case 'Polygon':
                    return staticMe.isDuplicatePolygon(geom1, geom2, delta);
                case 'MultiPoint':
                    return staticMe.isDuplicateLineString(geom1, geom2, delta);
                case 'MultiLineString':
                    return staticMe.isDuplicatePolygon(geom1, geom2, delta);
                case 'MultiPolygon':
                    return staticMe
                        .isDuplicateMultiPolygon(geom1, geom2, delta);
                case 'GeometryCollection':
                    return staticMe
                        .isDuplicateGeometryCollection(geom1, geom2, delta);
            }
        },

        /**
         * Checks two point geometries for equality.
         *
         * @param {ol.geom.Point} p1 the first point
         * @param {ol.geom.Point} p2 the second point
         * @param {number} delta the delta for comparison
         * @return {boolean} true if equal
         */
        isDuplicatePoint: function(p1, p2, delta) {
            var c1 = p1.getCoordinates();
            var c2 = p2.getCoordinates();
            return Math.abs(c1[0] - c2[0]) <= delta &&
                Math.abs(c1[1] - c2[1]) <= delta;
        },

        /**
         * Checks two line geometries for equality.
         *
         * @param {ol.geom.LineString} l1 the first line
         * @param {ol.geom.LineString} l2 the second line
         * @param {number} delta the delta for comparison
         * @return {boolean} true if equal
         */
        isDuplicateLineString: function(l1, l2, delta) {
            var c1 = l1.getCoordinates();
            var c2 = l2.getCoordinates();
            if (c1.length !== c2.length) {
                return false;
            }
            var duplicate = true;
            for (var i = 0; i < c1.length; ++i) {
                duplicate = duplicate &&
                    Math.abs(c1[i][0] - c2[i][0]) <= delta &&
                    Math.abs(c1[i][1] - c2[i][1]) <= delta;
                if (!duplicate) {
                    return false;
                }
            }
            return duplicate;
        },

        /**
         * Checks two polygon geometries for equality.
         *
         * @param {ol.geom.Polygon} p1 the first polygon
         * @param {ol.geom.Polygon} p2 the second polygon
         * @param {number} delta the delta for comparison
         * @return {boolean} true if equal
         */
        isDuplicatePolygon: function(p1, p2, delta) {
            var c1 = p1.getCoordinates();
            var c2 = p2.getCoordinates();
            return BasiGX.util.Geometry
                .isDuplicatePolygonCoordinates(c1, c2, delta);
        },

        /**
         * Checks two polygon coordinate arrays for equality.
         * The actual type must be number[][] (JSDoc can't handle this)!
         *
         * @param {number[]} c1 the first coordinate array
         * @param {number[]} c2 the second coordinate array
         * @param {number} delta the delta for comparison
         * @return {boolean} true if equal
         */
        isDuplicatePolygonCoordinates: function(c1, c2, delta) {
            if (c1.length !== c2.length) {
                return false;
            }
            var duplicate = true;
            for (var i = 0; i < c1.length; ++i) {
                if (c1[i].length !== c2[i].length) {
                    return false;
                }
                for (var j = 0; j < c1[i].length; ++j) {
                    duplicate = duplicate &&
                        Math.abs(c1[i][j][0] - c2[i][j][0]) <= delta &&
                        Math.abs(c1[i][j][1] - c2[i][j][1]) <= delta;
                    if (!duplicate) {
                        return false;
                    }
                }
            }
            return duplicate;
        },

        /**
         * Checks two multi polygon geometries for equality.
         *
         * @param {ol.geom.MultiPolygon} mp1 the first point
         * @param {ol.geom.MultiPolygon} mp2 the second point
         * @param {number} delta the delta for comparison
         * @return {boolean} true if equal
         */
        isDuplicateMultiPolygon: function(mp1, mp2, delta) {
            var staticMe = BasiGX.util.Geometry;
            var cs1 = mp1.getCoordinates();
            var cs2 = mp2.getCoordinates();

            if (cs1.length !== cs2.length) {
                return false;
            }
            var duplicate = true;
            for (var i = 0; i < cs1.length; ++i) {
                duplicate = duplicate && staticMe
                    .isDuplicatePolygonCoordinates(cs1[i], cs2[i], delta);
                if (!duplicate) {
                    return false;
                }
            }
            return duplicate;
        },

        /**
         * Checks two geometry collections for equality.
         *
         * @param {ol.geom.GeometryCollection} col1 the first collection
         * @param {ol.geom.GeometryCollection} col2 the second collection
         * @param {number} delta the delta for comparison
         * @return {boolean} true if equal
         */
        isDuplicateGeometryCollection: function(col1, col2, delta) {
            var geoms1 = col1.getGeometries();
            var geoms2 = col2.getGeometries();
            if (geoms1.length !== geoms2.length) {
                return false;
            }
            var duplicate = true;
            for (var i = 0; i < geoms1.length; ++i) {
                duplicate = duplicate && BasiGX.util.Geometry
                    .isDuplicate(geoms1[i], geoms2[i], delta);
                if (!duplicate) {
                    return false;
                }
            }
            return duplicate;
        },

        /**
         * Compares two ol.geom.Geometries.
         * @param {ol.geom.Geometry} geometry1 The first geometry for the
         *                                     comparison.
         * @param {ol.geom.Geometry} geometry2 The second geometry for the
         *                                     comparison.
         * @return {Boolean} Returns true if the WKT-representations are
         *                   identical.
         */
        equals: function(geometry1, geometry2) {
            if (!(geometry1 instanceof ol.geom.SimpleGeometry) ||
                    !(geometry2 instanceof ol.geom.SimpleGeometry)) {
                Ext.log.warn('Can only handle ol.geom.SimpleGeometry');
                return undefined;
            }
            var formatWKT = new ol.format.WKT();
            var wkt1 = formatWKT.writeGeometry(geometry1);
            var wkt2 = formatWKT.writeGeometry(geometry2);

            return wkt1 === wkt2;
        }
    }
});
