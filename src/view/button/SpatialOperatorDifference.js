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
 * Spatial Operator Difference Button
 *
 * @class BasiGX.view.button.SpatialOperatorDifference
 */
Ext.define('BasiGX.view.button.SpatialOperatorDifference', {
    extend: 'BasiGX.view.button.SpatialOperatorBase',
    xtype: 'basigx-button-spatial-operator-difference',

    requires: [
        'BasiGX.util.Geometry'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Difference on geometries',
            text: 'Difference on geometries'
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
         * intersect will be restricted to 2
         */
        maxAllowedFeaturesForOperation: 2,

        showSelectMasterSlaveFeatureDialog: true
    },

    handler: function() {
        // effectively disable the toggle functionality, behaves like
        // `enableToggle: false` but keeps the ability to be part
        // of a `toggleGroup`
        this.setPressed(false);
    },

    /**
     * Difference function which is given 2 geometries
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
        var differenceGeom;
        var newFeature = null;

        Ext.each(featureArray, function(feat) {
            parsedGeometries.push(parser.read(feat.getGeometry()));
        });

        for (var i = 0; i < parsedGeometries.length; i++) {
            if (i === 0) {
                differenceGeom = parsedGeometries[i];
            } else {
                differenceGeom = differenceGeom.difference(
                    parsedGeometries[i]);
            }
        }
        if (!differenceGeom.isValid() || differenceGeom.isEmpty() ||
            differenceGeom.getArea() === 0) {
            return false;
        }
        var result = parser.write(differenceGeom);
        newFeature = new ol.Feature({geometry: result});
        return newFeature;
    }
});
