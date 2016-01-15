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
 *
 * CSRF Util
 *
 * Some methods to access the csrf-token information served by spring security
 *
 * @class BasiGX.util.CSRF
 */
Ext.define('BasiGX.util.CSRF', {

    statics: {
        /**
        * Get the CSRF token value.
        * 
        * @return {String} - the key value, e.g. "741a3b1-221f-4d1d-..."
        */
        getValue: function() {
            return Ext.DomQuery.select('meta[name=_csrf]')[0].content;
        },

        /**
        * Get the CSRF token key.
        * 
        * @return {String} - the key string, e.g. "X-CSRF-TOKEN"
        */
        getKey: function() {
            return Ext.DomQuery.select('meta[name=_csrf_header]')[0].content;
        },

        /**
        * Get the full CSRF token object.
        * 
        * @return {Object} header - the header containing the csrf key and value
        */
        getHeader: function() {
            var me = this,
                header = {},
                headerName = me.getKey(),
                headerVal = me.getValue();

            header[headerName] = headerVal;

            return header;
        }
    }
});
