/* global jsts*/
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
 * Spatial Operator Intersect Button
 *
 * @class BasiGX.view.button.SpatialOperatorIntersect
 */
Ext.define('BasiGX.view.button.SpatialOperatorIntersect', {
    extend: 'BasiGX.view.button.SpatialOperatorBase',
    xtype: 'basigx-button-spatial-operator-intersect',

    requires: [
        'BasiGX.util.Geometry'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Intersect geometries',
            text: 'Intersect geometries'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    config: {

        targetVectorLayer: null,

        /**
         * the number of features which are allowed to process together.
         * Union may use a high number without problems,
         * intersect will be restricted to 2. With fullSplit set to true, the
         * number is not limited.
         */
        maxAllowedFeaturesForOperation: 2,

        /**
         * If set to true, the operator will calculate all resulting parts of
         * the intersection, including the parts that do not intersect with
         * other geometries. Default is false.
         * @type {Boolean}
         */
        fullSplit: false,

        /**
         * The tolerance to use when comparing geometries during difference and
         * intersection calculation. Set this to a sane value in order to avoid
         * getting overlapping/duplicate geometries. This is also used to filter
         * out geometries smaller that this value in size (this happens a lot if
         * multiple geometries are involved).
         * @type {Number}
         */
        tolerance: 0
    },

    handler: function() {
        // effectively disable the toggle functionality, behaves like
        // `enableToggle: false` but keeps the ability to be part
        // of a `toggleGroup`
        this.setPressed(false);
    },

    /**
     * Intersect function which is given 2 geometries
     *
     * @param {Array} featureArray The array holding the features to handle
     * @return {ol.Feature} The final feature
     */
    processSelectedGeometries: function(featureArray) {
        if (!jsts) {
            Ext.log.error('No jsts could be found, check your application ' +
                'resources and make sure to include the jsts library');
            return;
        }
        var parser = new jsts.io.OL3Parser();
        var parsedGeometries = [];
        var intersectionGeom;

        Ext.each(featureArray, function(feat) {
            parsedGeometries.push(parser.read(feat.getGeometry()));
        });

        if (this.getFullSplit()) {
            intersectionGeom = this.calculateFullSplit(parsedGeometries);
        } else {
            intersectionGeom = this.calculateSingleIntersection(
                parsedGeometries);
        }

        if (intersectionGeom) {
            if (!Ext.isArray(intersectionGeom)) {
                intersectionGeom = [intersectionGeom];
            }
            var newFeatures = [];
            Ext.each(intersectionGeom, function(geom) {
                var result = parser.write(geom);
                newFeatures.push(new ol.Feature({geometry: result}));
            });
            return newFeatures;
        }

        return false;
    },

    /**
     * Normalizes the geometry, then adds it to the list if not contained yet.
     * This is a rather expensive operation, use only when necessary!
     * @param  {jsts.geom.Geometry} geom the jsts geometry
     * @param  {Array} list the list to possibly add the geometry to
     */
    pushIfNotEqual: function(geom, list) {
        var me = this;
        var foundEqual = false;
        geom.normalize();

        Ext.each(list, function(other) {
            if (other.equalsExact(geom, me.getTolerance())) {
                foundEqual = true;
                return false;
            }
        });
        if (!foundEqual) {
            list.push(geom);
        }
    },

    /**
     * Calculates just the intersection of some geometries.
     * @param  {jsts.geom.Geometry} parsedGeometries the jsts geometries
     * @return {jsts.geom.Geometry|Boolean} the intersection, or false, if it
     * could not be calculated or the resulting geometry is too small or invalid
     */
    calculateSingleIntersection: function(parsedGeometries) {
        var intersectionGeom;
        for (var i = 0; i < parsedGeometries.length; i++) {
            if (i === 0) {
                intersectionGeom = parsedGeometries[i];
            } else {
                intersectionGeom = intersectionGeom.intersection(
                    parsedGeometries[i]);
            }
        }
        if (!intersectionGeom.isValid() || intersectionGeom.isEmpty() ||
            (intersectionGeom.getGeometryType() !== 'Polygon' &&
            intersectionGeom.getGeometryType() !== 'MultiPolygon') ||
            intersectionGeom.getArea() <= this.getTolerance()) {
            return false;
        }
        return intersectionGeom;
    },

    /**
     * Calculates the difference polygons for a set of polygons. The difference
     * polygons are the parts of the polygons that do not intersect with any
     * others.
     * @param  {jsts.geom.Geometry[]} geometries the jsts geometries
     * @return {jsts.geom.Geometry[]} the set of difference polygons
     */
    calculateDifferences: function(geometries) {
        var me = this;
        var results = [];

        Ext.each(geometries, function(geometry) {
            var difference = geometry;
            Ext.each(geometries, function(other) {
                try {
                    if (geometry !== other) {
                        difference = difference.difference(other);
                    }
                } catch (e) {
                    // ignore topology exceptions for now
                }
            });
            if (difference.isEmpty() || !difference.isValid() ||
                (difference.getGeometryType() !== 'Polygon' &&
                difference.getGeometryType() !== 'MultiPolygon') ||
                difference.getArea() <= me.getTolerance()) {
                return;
            }
            me.pushIfNotEqual(difference, results);
        });

        return results;
    },

    /**
     * Calculates the intersection geometries for a given set of polygons. Note
     * that this may calculate overlapping polygons if multiple polygons are
     * involved.
     * @param  {jsts.geom.Geometry[]} geometries the jsts geometries
     * @return {jsts.geom.Geometry[]} the intersection polygon list
     */
    calculateIntersections: function(geometries) {
        var me = this;
        var results = [];

        Ext.each(geometries, function(geometry) {
            Ext.each(geometries, function(other) {
                if (geometry === other) {
                    return;
                }
                try {
                    var intersection = geometry.intersection(other);
                    if (intersection.isEmpty() || !intersection.isValid() ||
                        (intersection.getGeometryType() !== 'Polygon' &&
                        intersection.getGeometryType() !== 'MultiPolygon') ||
                        intersection.getArea() <= me.getTolerance()) {
                        return;
                    }
                    me.pushIfNotEqual(intersection, results);
                } catch (e) {
                    // ignore topology exceptions for now
                }
            });
        });

        return results;
    },

    /**
     * Calculates the full split polygons when intersecting a group of polygons.
     * It works by repeatedly calculating the difference polygons, adding them
     * to the list of results, and then calculating the intersections. If no
     * differences were found, they're added to the results list and we're done.
     * If differences were found, repeat the process with the differences as new
     * input.
     * @param  {jsts.geom.Geometry[]} geometries the list of input polygons
     * @return {jsts.geom.Geometry[]} the list of the resulting split geometries
     */
    calculateFullSplit: function(geometries) {
        var me = this;
        var results = [];
        var intersections = geometries;

        while (intersections.length > 0) {
            var differences = this.calculateDifferences(intersections);
            Ext.each(differences, function(geom) {
                me.pushIfNotEqual(geom, results);
            });
            intersections = this.calculateIntersections(intersections);
            if (differences.length === 0) {
                Ext.each(intersections, function(geom) {
                    me.pushIfNotEqual(geom, results);
                });
                intersections = [];
            }
        }

        return results;
    }

});
