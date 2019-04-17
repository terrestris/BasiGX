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
 * Utility class containing a static method for rendering a mouse coordinates
 * formatted depending on currently set application projection.
 *
 * @class BasiGX.util.MouseCoordinates
 */
Ext.define('BasiGX.util.MouseCoordinates', {

    statics: {
        enNorth: 'N',
        enEast: 'E',
        enSouth: 'S',
        enWest: 'W',
        /* begin i18n */
        mousePositionLabel: '',
        dspNorth: '',
        dspEast: '',
        dspSouth: '',
        dspWest: '',
        /* end i18n */

        /**
         * Renderer for mouse coordinate string representation. The format
         * depends on configured projection of the application. If some metric
         * projection (e.g. EPSG:25832 or EPSG:3857) are used, coordinates are
         * shown in meter, otherwise (e.g. EPSG:4326) degrees units are used.
         *
         * @param {Array<Number>} coord Current coordinate pair to be shown.
         * @param {Array<Number>} hideProjectionName Whether the prefix
         *     containing current projection name should be hidden or not.
         * @return {String} Formatted mouse position label.
         */
        mouseCoordinateRenderer: function(coord, hideProjectionName) {
            var staticMe = BasiGX.util.MouseCoordinates;
            var map = BasiGX.util.Map.getMapComponent().getMap();
            var proj = map.getView().getProjection();
            var unitsAreMetric = proj.getUnits() === 'm';

            // for some reason, in case of metric units, the fraction digits
            // seem not to be correct/irritating in case of metric units...
            var fractionDigits = unitsAreMetric === true ? 0 : 3;

            var decimal = ol.coordinate.format(
                coord, '{x} / {y}', fractionDigits
            );
            var decimalSeparator = Ext.util.Format.decimalSeparator;

            if (decimalSeparator !== '.') {
                // replace the point as decimal separator with locale one
                decimal = decimal.replace(/\./g, decimalSeparator);
            }

            if (!unitsAreMetric) {
                var hdms = ol.coordinate.toStringHDMS(coord);
                // handle possibly different abbreviations for north, east, etc.
                if (staticMe.enNorth !== staticMe.dspNorth) {
                    hdms = hdms.replace(
                        new RegExp(staticMe.enNorth, 'g'),
                        staticMe.dspNorth
                    );
                }
                if (staticMe.enEast !== staticMe.dspEast) {
                    hdms = hdms.replace(
                        new RegExp(staticMe.enEast, 'g'),
                        staticMe.dspEast
                    );
                }
                if (staticMe.enSouth !== staticMe.dspSouth) {
                    hdms = hdms.replace(
                        new RegExp(staticMe.enSouth, 'g'),
                        staticMe.dspSouth
                    );
                }
                if (staticMe.enWest !== staticMe.dspWest) {
                    hdms = hdms.replace(
                        new RegExp(staticMe.enWest, 'g'),
                        staticMe.dspWest
                    );
                }
                if (hideProjectionName) {
                    return Ext.String.format(
                        "{0}<br/>({1})",
                        decimal, hdms
                    );
                } else {
                    return Ext.String.format(
                        "{0} ({1}): {2}<br/>({3})",
                        staticMe.mousePositionLabel, proj.getCode(),
                        decimal, hdms
                    );
                }
            } else {
                if (hideProjectionName) {
                    return Ext.String.format("{0} (m)", decimal);
                } else {
                    return Ext.String.format(
                        "{0} ({1}):<br/>{2} (m)",
                        staticMe.mousePositionLabel, proj.getCode(),
                        decimal
                    );
                }

            }
        }
    }
});
