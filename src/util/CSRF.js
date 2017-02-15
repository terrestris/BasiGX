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
 *
 * CSRF Utility methods.
 *
 * Some methods to access the csrf-token information served by spring security.
 *
 * The methods herein assume a certain HTML structure, which is easiest achieved
 * by including a markup like the following in your base HTML:
 *
 *     <meta name="_csrf" content="${_csrf.token}" />
 *     <meta name="_csrf_header" content="${_csrf.headerName}" />
 *     <meta name="_csrf_parameter_name" content="${_csrf.parameterName}" />
 *
 * All methods will warn if the structure in the DOM is not as expected.
 *
 * @class BasiGX.util.CSRF
 */
Ext.define('BasiGX.util.CSRF', {

    requires: [
        'Ext.String',
        'Ext.DomQuery'
    ],

    statics: {
        /**
         * A utility method to get the `content` attribute of a `<meta>`-tag
         * with the given name. Will issue a warning to the console if the
         * tag cannot be found.
         *
         * @param {String} name The name of the `<meta>`-tag we look for.
         * @return {String} The content attribute of the `<meta>`-tag, or the
         *     empty string if the tag was not found.
         * @private
         */
        getContentFromMetaTagByName: function(name) {
            var selector = Ext.String.format('meta[name="{0}"]', name);
            var element = Ext.DomQuery.select(selector)[0];
            var content;
            if (element) {
                content = element.content || '';
            } else {
                var tpl = 'Failed to find tag <meta name="{0}" />. Is it ' +
                    ' present in the page DOM?';
                var msg = Ext.String.format(tpl, name);
                Ext.log.warn(msg);
                content = '';
            }
            return content;
        },

        /**
         * Get the CSRF token value.
         *
         * In order for this method to produce reliable output, your base HTML
         * page should contain a `<meta>`-tag in the `<head>` with name
         * `_csrf`. The `content` attribute is best filled from Spring by
         * using this variable: `${_csrf.token}`.
         *
         * @return {String} - the key value, e.g. "741a3b1-221f-4d1d-..." or the
         *     empty string if the meta tag cannot be found.
         */
        getValue: function() {
            var metaName = '_csrf';
            return BasiGX.util.CSRF.getContentFromMetaTagByName(metaName);
        },

        /**
         * Get the CSRF token key. This can be used if you want to send CSRF
         * tokens as header. If you want to send it using a form parameter, use
         * the method #getParamName instead.
         *
         * In order for this method to produce reliable output, your base HTML
         * page should contain a `<meta>`-tag in the `<head>` with name
         * `_csrf_header`. The `content` attribute is best filled from Spring by
         * using this variable: `${_csrf.headerName}`.
         *
         * @return {String} - the key string, e.g. "X-CSRF-TOKEN" ort the empty
         *     string if the meta tag cannot be found.
         */
        getKey: function() {
            var metaName = '_csrf_header';
            return BasiGX.util.CSRF.getContentFromMetaTagByName(metaName);
        },

        /**
         * Get the name of the parameter to send when you want to pass CSRF
         * tokens via a form. Alternatively you can use #getKey to get the name
         * of the header to send for CSRF-protection.
         *
         * In order for this method to produce reliable output, your base HTML
         * page should contain a `<meta>`-tag in the `<head>` with name
         * `_csrf_parameter_name`. The `content` attribute is best filled from
         * Spring by using this variable: `${_csrf.parameterName}`.
         *
         * @return {String} The name of the parameter to send when sending CSRF
         *     tokens via forms, e.g. "_csrf" or the empty string if the meta
         *     tag cannot be found.
         */
        getParamName: function() {
            var metaName = '_csrf_parameter_name';
            return BasiGX.util.CSRF.getContentFromMetaTagByName(metaName);
        },

        /**
         * Get the full CSRF token object. Can directly be used for AJAX queries
         * e.g. by passing them as `header` config to `Ext.Ajax.request`.
         *
         * @return {Object} header - the header containing the CSRF key and
         *     value or an empty object if any of the required meta fields
         *     cannot be found.
         */
        getHeader: function() {
            var staticMe = BasiGX.util.CSRF;
            var header = {};
            var headerName = staticMe.getKey();
            var headerVal = staticMe.getValue();

            if (headerName && headerVal) {
                header[headerName] = headerVal;
            }

            return header;
        },

        /**
         * Returns an `Ext.dom.Helper` specification for adding an
         * `<input type="hidden">` that contains the relevant CSRF information.
         *
         * @return {Object} A specification for a correctly configured hidden
         *     input field for sending the CSRF information or such a
         *     specification without `name` and `value` if any of the required
         *     meta fields cannot be found.
         */
        getDomHelperField: function() {
            var staticMe = BasiGX.util.CSRF;
            var name = staticMe.getParamName();
            var value = staticMe.getValue();
            var field = {
                tag: 'input',
                type: 'hidden'
            };
            if (name && value) {
                field = Ext.apply(field, {
                    name: name,
                    value: value
                });
            }
            return field;
        }

    }
});
