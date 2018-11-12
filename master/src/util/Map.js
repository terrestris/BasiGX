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
 *
 * Map Util
 *
 * Some methods to work with ol-layers
 *
 * @class BasiGX.util.Map
 */
Ext.define('BasiGX.util.Map', {

    statics: {
        /**
         * The dpi as defined by OGC (e.g. for WMTS tile matrix sets).
         * Calculated as 25.4 / 0.28
         *   * 25.4 mm in one inch
         *   * one pixel is 0.28mm (per spec of OGC)
         *
         * @type {Number}
         */
        dpi: 90.7142857142857, // = 25.4 / 0.28;

        /**
         * The number of inches in a meter.
         *
         * @type {Number}
         */
        inchesPerMeter: 39.37,

        /**
         * Given a scale and a unit, this method will return a resolution.
         *
         * @param {Number} scale The scale you wish to have the resolution for.
         * @param {String} units The units to get the resolution for, typically
         *     the unit of the projection of the map view. Allowed values are
         *     `'degrees'`, `'ft'`, `'m'` or `'us-ft'`
         * @return {Number} The calculated resolution.
         */
        getResolutionForScale: function(scale, units) {
            var dpi = this.dpi;
            var inchesPerMeter = this.inchesPerMeter;
            var mpu = ol.proj.METERS_PER_UNIT[units];
            return parseFloat(scale) / (mpu * inchesPerMeter * dpi);
        },

        /**
         * Given a resolution and a unit, this method will return a scale.
         *
         * @param {Number} resolution The resolution you wish to have the scale
         *     for.
         * @param {String} units The units to get the resoultuion for, typically
         *     the unit of the projection odf the map view. Allowed values are
         *     `'degrees'`, `'ft'`, `'m'` or `'us-ft'`
         * @return {Number} The calculated scale.
         */
        getScaleForResolution: function(resolution, units) {
            var dpi = this.dpi;
            var inchesPerMeter = this.inchesPerMeter;
            var mpu = ol.proj.METERS_PER_UNIT[units];
            return (resolution * mpu * inchesPerMeter * dpi);
        },

        /**
         * Returns the resolution of the passed map's view.
         *
         * @param {ol.Map} map The map to get the resolution from.
         * @return {Number} The resolution of the view of the passed map.
         */
        getResolution: function(map) {
            return map.getView().getResolution();
        },

        /**
         * Gets the scale of the passed map.
         *
         * See also http://gis.stackexchange.com/questions/158435/how-to-get-cur
         * rent-scale-in-openlayers-3
         *
         * @param {ol.Map} map The map to get the scale from.
         * @return {Number} The scale of the map.
         */
        getScale: function(map) {
            var res = this.getResolution(map);
            var units = map.getView().getProjection().getUnits();
            return this.getScaleForResolution(res, units);
        },

        /**
         * Determine map component depending on provided xtype.
         *
         * If no xtype was specified, `basigx-component-map` component will be
         * used as fallback. If this also could not be found, use the first
         * GeoExt map component with xtype `gx_map`.
         *
         * @param {String} mapCompXType Provided map component xtype
         * @return {Object} The map component, which is at least a
         *     GeoExt.component.Map and possibly an instance of the xtype you
         *     passed.
         */
        getMapComponent: function(mapCompXType) {
            var mapComponent;
            if (mapCompXType) {
                mapComponent = Ext.ComponentQuery.query(mapCompXType)[0];
            }

            //fallback to basigx map component
            if (Ext.isEmpty(mapComponent)) {
                mapComponent = Ext.ComponentQuery.query(
                    'basigx-component-map'
                )[0];
            }

            //fallback to the most common GeoExt map component
            if (Ext.isEmpty(mapComponent)) {
                mapComponent = Ext.ComponentQuery.query('gx_map')[0];
            }

            return mapComponent;
        },

        /**
         * Determine legendtree panel component depending on provided xtype.
         * If no xtype was specified, `basigx-panel-legendtree` component will
         * be used as fallback.
         * @param {String} legendCompXType Provided map component xtype
         * @return {Object} The legend component.
         */
        getLegendTreePanel: function(legendCompXType) {
            var legendComponent;

            if (legendCompXType) {
                legendComponent = Ext.ComponentQuery.query(legendCompXType)[0];
            }
            //fallback to basigx legendtree panel component
            if (Ext.isEmpty(legendComponent)) {
                legendComponent = Ext.ComponentQuery.query(
                    'basigx-panel-legendtree'
                )[0];
            }
            return legendComponent;
        }
    }
});
