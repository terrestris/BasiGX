/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
        getResolution: function (map) {
            return map.getView().getResolution();
        },

        /**
         * http://gis.stackexchange.com/questions/158435/how-to-get-current-scale-in-openlayers-3
         */
        getScale: function(map){
            var res = this.getResolution(map);
            var units = map.getView().getProjection().getUnits();
            var dpi = 25.4 / 0.28;
            var mpu = ol.proj.METERS_PER_UNIT[units];
            var inchesPerMeter = 39.37;

            return res * mpu * inchesPerMeter * dpi;
        },

        /**
         * Determine map component depending on provided xtype.
         * If no xtype was specified, `basigx-component-map` component will be
         * used as fallback. If this also could not be found, use the most
         * common GeoExt map component `gx_map`.
         * @param {String} mapCompXtype Provided map component xtype
         * @return {Object} mapComponent
         */
        getMapComponent: function(mapCompXType){
            var mapComponent;
            if (mapCompXType) {
                mapComponent = Ext.ComponentQuery.query(mapCompXType)[0];
            }

            //fallback to basigx map component
            if (Ext.isEmpty(mapComponent)) {
                mapComponent = Ext.ComponentQuery.query('basigx-component-map')[0];
            }

            //fallback to the most common GeoExt map component
            if (Ext.isEmpty(mapComponent)) {
                mapComponent = Ext.ComponentQuery.query('gx_map')[0];
            }

            return mapComponent;
        },

        /**
         * Determine legendtree panel component depending on provided xtype.
         * If no xtype was specified, `basigx-panel-legendtree` component will be
         * used as fallback.
         * @param {String} legendCompXType Provided map component xtype
         * @return {Object} legendComponent
         */
        getLegendTreePanel: function(legendCompXType){
            var legendComponent;

            if (legendCompXType) {
                legendComponent = Ext.ComponentQuery.query(legendCompXType)[0];
            }
            //fallback to basigx legendtree panel component
            if (Ext.isEmpty(legendComponent)) {
                legendComponent = Ext.ComponentQuery.query('basigx-panel-legendtree')[0];
            }
            return legendComponent;
        },
    }
});
