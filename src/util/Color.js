/* Copyright (c) 2016-present terrestris GmbH & Co. KG
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
 * @class BasiGX.util.Color
 */
Ext.define('BasiGX.util.Color', {

    statics: {

        /**
         * This method converts a hex color string into an rgba color string.
         *
         * Example:
         *
         *     var rgba = BasiGX.util.Color.hexToRgba("#ff0000", 0.5);
         *     // rgba is now: "rgba(255,0,0,0.5)"
         *
         * @param {String} hex The hex string to convert.
         * @param {Number} opacity The opacity to set, should be between `` and
         *     `1`.
         * @return {String} A `rgba(r,g,b,a)` color string.
         */
        hexToRgba: function(hex, opacity) {
            hex = hex.replace('#', '');
            var r = parseInt(hex.substring(0, 2), 16);
            var g = parseInt(hex.substring(2, 4), 16);
            var b = parseInt(hex.substring(4, 6), 16);
            var a = opacity;

            if (opacity) {
                return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
            }
            return 'rgba(' + r + ',' + g + ',' + b + ',1)';
        },

        /**
         * This method converts a hex color string into an rgba color string.
         *
         * Example:
         *
         *     var rgba = BasiGX.util.Color.hex8ToRgba("#ff000000");
         *     // rgba is now: "rgba(255,0,0,0)"
         *
         * @param {String} hex8 The hex8 string to convert.
         * @return {String} A `rgba(r,g,b,a)` color string.
         */
        hex8ToRgba: function(hex8) {
            hex8 = hex8.replace('#', '');
            var r = parseInt(hex8.substring(0, 2), 16);
            var g = parseInt(hex8.substring(2, 4), 16);
            var b = parseInt(hex8.substring(4, 6), 16);
            var a = (parseInt(hex8.substring(6, 8), 16) / 255).toFixed(2) * 1;

            var result = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
            return result;
        },

        /**
         * This method converts a rgba color string into an hex6 color string.
         * Warning: You will loose the alpha channel when using this method.
         *
         * Example:
         *
         *     var hex = BasiGX.util.Color.rgbaToHex("rgba(255,0,0,0)");
         *     // hex is now: "#ff0000"
         *
         * @param {String} rgba A `rgba(r,g,b,a)` color string.
         * @return {String} A hexadecimal color string, e.g. `#ff0000`.
         */
        rgbaToHex: function(rgba) {
            if (!rgba) {
                return '';
            }
            // TODO we should have a utility rgbAsArray, just like we have
            // rgbaAsArray, or not?
            var regex = new RegExp('^rgba?[\\s+]?\\([\\s+]?(\\d+)[\\s+]?,' +
                '[\\s+]?(\\d+)[\\s+]?,[\\s+]?(\\d+)[\\s+]?', 'i');
            rgba = rgba.match(regex);

            if (!rgba || rgba.length !== 4) {
                return '';
            }

            var makeHex = BasiGX.util.Color.makeHex;
            var r = makeHex(rgba[1]);
            var g = makeHex(rgba[2]);
            var b = makeHex(rgba[3]);

            return '#' + r + g + b;
        },

        /**
         * This method converts a rgba color string into an hex8 color string.
         *
         * Example:
         *     var hex = BasiGX.util.Color.rgbaToHex("rgba(255,0,0,0)");
         *     // hex is now: "#ff000000"
         *
         * @param {String} rgba A `rgba(r,g,b,a)` color string.
         * @return {String} A hex8 color string, with alpha; e.g. `#ff000000`.
         */
        rgbaToHex8: function(rgba) {
            if (!rgba) {
                return '';
            }
            rgba = BasiGX.util.Color.rgbaAsArray(rgba);

            if (!rgba || rgba.length !== 5) {
                return '';
            }

            var makeHex = BasiGX.util.Color.makeHex;
            var r = makeHex(rgba[1]);
            var g = makeHex(rgba[2]);
            var b = makeHex(rgba[3]);
            var a = makeHex('' + Math.round(parseFloat(rgba[4]) * 255));

            return '#' + r + g + b + a;
        },

        /**
         * Returns the two digit hexadecimal value of the passed number string
         * (between `'0'` and `'255'`).
         *
         * @param {String} numStr The number to convert as a string.
         * @return {String} The hexadecimal number.
         */
        makeHex: function(numStr) {
            var hex = parseInt(numStr, 10).toString(16);
            return ('0' + hex).slice(-2);
        },

        /**
         * Returns an array of the parts of an `rgba(r,g,b,a)` string as array.
         * The index `1` will be `r`, `2` will be `g`, `3` will be `b` and
         * `4` will be `a`.
         *
         * @param {String} rgba An `rgba(r,g,b,a)` string.
         * @return {Array} An array with the parts of the rgba-string.
         */
        rgbaAsArray: function(rgba) {
            var regex = new RegExp('^rgba?[\\s+]?\\([\\s+]?(\\d+)[\\s+]?,' +
                '[\\s+]?(\\d+)[\\s+]?,[\\s+]?(\\d+)[\\s+]?,' +
                '[\\s+]?(\\d+(?:\\.\\d+|))[\\s+]?', 'i');
            rgba = rgba.match(regex);
            return rgba;
        }
    }
});
