/*global Ext, window*/
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
 * Layer Util
 *
 * Some methods to work with ol-layers
 *
 */
Ext.define('BasiGX.util.Url', {
    statics: {

        /**
         * Returns an URL params value from the current location or the given
         * optional url.
         *
         * @param {String} key The key to search for
         * @param {String} [url=location.href] The url to search in.
         */
        getParamValue: function(key, url){
            var re = new RegExp('[\\?&]' + (key + "") + '=([^&#]*)'),
                regexResult = re.exec(url || window.location.href),
                value;
            if (regexResult) {
                value = decodeURIComponent(regexResult[1]);
            }
            return value;
        },

        /**
         * Returns the URL of the used application like this
         *
         *   http://localhost:8080/Tribulus/client/gizmo/index-dev.html?
         */
        getCurrentAppUrl: function() {

            return window.location.protocol + "//" + window.location.host + window.location.pathname + "?";
        },

        /**
         * Return the name of the web project like this
         *
         *   Tribulus
         */
        getWebProjectBaseUrl: function() {

            var url = window.location.protocol + "//" + window.location.host,
                webProjectName = window.location.pathname.match(/\/[A-Za-z\-]*\//)[0];

            return url + webProjectName;
        },

        /**
         * Return the name of the basepath of the project like this
         *
         * http://somehost:someport/
         */
        getProjectBaseUrl: function() {
            var baseUrl = window.location.protocol + "//" + window.location.host + "/";
            return baseUrl;
        }

    }
});
