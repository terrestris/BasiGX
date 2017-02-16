/*global Ext, window*/
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
 * URL Util
 *
 * Some methods to work with URLs
 *
 * TODO These methods should be refactored, see inline comments.
 *
 * @class BasiGX.util.Url
 */
Ext.define('BasiGX.util.Url', {
    statics: {

        /**
         * Returns an URL params value from the current location or the given
         * optional url.
         *
         * @param {String} key The key to search for
         * @param {String} [url=location.href] The url to search in.
         * @return {String} The value of the `key`-parameter inside of `url`.
         */
        getParamValue: function(key, url) {
            var re = new RegExp('[\\?&]' + (key + '') + '=([^&#]*)');
            var regexResult = re.exec(url || window.location.href);
            var value;
            if (regexResult) {
                value = decodeURIComponent(regexResult[1]);
            }
            return value;
        },

        /**
         * Returns the URL of the used application like this
         *
         *     http://localhost:8080/Tribulus/client/gizmo/index-dev.html?
         *
         * TODO can we really assume the presence of location.host?
         *
         * @return {String} The URL of the application.
         */
        getCurrentAppUrl: function() {
            var loc = window.location;
            return loc.protocol + '//' + loc.host + loc.pathname + '?';
        },

        /**
         * Return the base URL of the web project.
         *
         * TODO Are we sure we have an application always deployed like it is
         *      assumed herein?
         *
         * @return {String} The base URL including the webproject name (first
         *     'folder').
         */
        getWebProjectBaseUrl: function() {
            var loc = window.location;
            var url = loc.protocol + '//' + loc.host;
            var webProjectName = window.location.pathname.match(
                /\/[A-Za-z\-]*\//
            )[0];

            return url + webProjectName;
        },

        /**
         * Return the project base URL, e.g. `http://somehost:someport/`.
         *
         * @return {String} The project base URL, e.g.
         *     `http://somehost:someport/`.
         */
        getProjectBaseUrl: function() {
            var loc = window.location;
            var baseUrl = loc.protocol + '//' + loc.host + '/';
            return baseUrl;
        }

    }
});
