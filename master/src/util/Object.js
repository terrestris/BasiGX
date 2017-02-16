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
 * Object Util
 *
 * Some methods to work with an Object
 *
 * @class BasiGX.util.Object
 */
Ext.define('BasiGX.util.Object', {

    requires: ['BasiGX.util.Application'],

    statics: {

        /**
         * Method may be used to return a value of a given input object by a
         * provided query key. The query key can be used in two ways:
         *   * Single-value: Find the first matching key in the provided object
         *     (Use with caution as the object/array order may not be as
         *     expected and/or deterministic!).
         *   * Backslash ("/") separated value: Find the last (!) matching key
         *     in the provided object.
         *
         * @param {String} queryKey The key to be searched.
         * @param {Object} [queryObject] The object to be searched on. If not
         *     provided the global application context (on root-level) will
         *     be used.
         *
         * @return {*} The target value or `undefined` if the given couldn't be
         *     found.
         */
        getValue: function(queryKey, queryObject) {
            var me = this;
            var queryMatch;

            // if weren't called with an queryObject, get the global application
            // context as input value
            if (!queryObject) {
                queryObject = BasiGX.util.Application.getAppContext() ||
                    Ext && Ext.app && Ext.app.Application &&
                    Ext.app.Application.instance &&
                    Ext.app.Application.instance.getApplicationContext ?
                    Ext.app.Application.instance.getApplicationContext() : null;
            }

            if (!Ext.isObject(queryObject)) {
                Ext.Logger.error('Missing input parameter ' +
                        'queryObject <Object>!');
                return false;
            }

            if (!Ext.isString(queryKey)) {
                Ext.Logger.error('Missing input parameter queryKey <String>!');
                return false;
            }

            // if the queryKey contains backslashes we understand this as the
            // path in the object-hierarchy and will return the last matching
            // value
            if (queryKey.split('\/').length > 1) {
                Ext.each(queryKey.split('\/'), function(key) {
                    if (queryObject[key]) {
                        queryObject = queryObject[key];
                    } else {
                        // if the last entry wasn't found return the last match
                        return queryObject;
                    }
                });
                return queryObject;
            }

            // iterate over the input object and return the first matching
            // value
            for (var key in queryObject) {

                // get the current value
                var value = queryObject[key];

                // if the given key is the queryKey, let's return the
                // corresponding value
                if (key === queryKey) {
                    return value;
                }

                // if the value is an object, let's call ourself recursively
                if (Ext.isObject(value)) {
                    queryMatch = me.getValue(queryKey, value);
                    if (queryMatch) {
                        return queryMatch;
                    }
                }

                // if the value is an array and the array contains an object as
                // well, let's call ourself recursively for this object
                if (Ext.isArray(value)) {
                    for (var i = 0; i < value.length; i++) {
                        var val = value[i];
                        if (Ext.isObject(val)) {
                            queryMatch = me.getValue(queryKey, val);
                            if (queryMatch) {
                                return queryMatch;
                            }
                        }
                    }
                }
            }

            // if we couldn't find any match, return undefined
            return undefined;
        }
    }
});
