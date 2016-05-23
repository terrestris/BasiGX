/* Copyright (c) 2016 terrestris GmbH & Co. KG
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
         * Method converts a hex8 color string into an rgba color string.
         *
         * Example:
         *     var rgba = BasiGX.util.Color.hexToRgba("#ff0000", 0.5);
         *     // rgba is now: "rgba(255,0,0,0.5)"
         */
        hexToRgba: function(hex, opacity) {
            hex = hex.replace('#','');
            var r = parseInt(hex.substring(0,2), 16);
            var g = parseInt(hex.substring(2,4), 16);
            var b = parseInt(hex.substring(4,6), 16);
            var a = opacity;

            if(opacity){
                return 'rgba('+r+','+g+','+b+','+a+')';
            }
            return 'rgba('+r+','+g+','+b+',1)';
        },

        /**
         * Method converts a hex8 color string into an rgba color string.
         *
         * Example:
         *     var rgba = BasiGX.util.Color.hex8ToRgba("#ff000000");
         *     // rgba is now: "rgba(255,0,0,0)"
         */
        hex8ToRgba: function(hex8) {
            hex8 = hex8.replace('#','');
            var r = parseInt(hex8.substring(0,2), 16);
            var g = parseInt(hex8.substring(2,4), 16);
            var b = parseInt(hex8.substring(4,6), 16);
            var a = (parseInt(hex8.substring(6,8), 16) / 255).toFixed(2) * 1;

            var result = 'rgba('+r+','+g+','+b+','+a+')';
            return result;
        },

        /**
         * Method converts a rgba color string into an hex6 color string.
         * Warning: You will loose the alpha channel when using this method.
         *
         * Example:
         *     var hex = BasiGX.util.Color.rgbaToHex("rgba(255,0,0,0)");
         *     // hex is now: "#ff0000"
         */
        rgbaToHex: function(rgba){
            var regex = new RegExp("^rgba?[\\s+]?\\([\\s+]?(\\d+)[\\s+]?," +
                "[\\s+]?(\\d+)[\\s+]?,[\\s+]?(\\d+)[\\s+]?", "i");
            rgba = rgba.match(regex);
            return (rgba && rgba.length === 4) ? "#" +
                ("0" + parseInt(rgba[1],10).toString(16)).slice(-2) +
                ("0" + parseInt(rgba[2],10).toString(16)).slice(-2) +
                ("0" + parseInt(rgba[3],10).toString(16)).slice(-2) : '';
        }
    }
});
