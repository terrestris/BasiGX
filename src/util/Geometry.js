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
         * Compares two ol.geom.Geometries.
         * @param {ol.geom.Geometry} geometry1 The first geometry for the comparison.
         * @param {ol.geom.Geometry} geometry2 The second geometry for the comparison.
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
