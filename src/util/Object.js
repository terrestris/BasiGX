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

    requires: [
        'Ext.Object',
        'BasiGX.util.Application'
    ],

    statics: {
        /**
         * Returns the value of a key in the passed object, when we do not know
         * exactly how the key was spelled (e.g. with regard to casing). This
         * can be useful, if the object contains key-value-pairs which
         * represent URL-parameters. With this method you can e.g. find LAYERS,
         * layers and any other casing (by providing a regular expression) in an
         * object that represents common WMS query paramers like the ones from
         * `wmsSource.getParams()`.
         *
         * Example:
         *
         *     var params = wmsSource.getParams();
         *     var layers = BasiGX.util.Object.getValueSpellingVariants(
         *         params, ['LAYERS', 'layers'], /^layers$/i
         *     );
         *     // layers now contains the value of e.g. params.LAYERS,
         *     // params.layers or params.LaYeRs
         *
         * @param {Object} obj The object in which the key whose spelling is
         *     unclear will be looked up. Required.
         * @param {String[]} commonVariants An array of strings with common
         *     variants of the key, these will be looked up first and in order.
         *     At least `commonVariants` or `variantRe` must be passed. You can
         *     pass both. If one of the keys herein is existing in `obj`, we'll
         *     return the value at that key and will not make use of the regular
         *     expression in `variantRe`.
         * @param {RegExp} variantRe A regular expression matching the key of
         *     which we do not know the spelling. At least `variantRe` or
         *     `commonVariants` must be passed. You can pass both. If a common
         *     variant exists in `obj`, this will not be considered. Otherwise
         *     the *first* key in `obj` that matches the regular expression will
         *     be used.
         * @return {*} The value stored in `obj` at the first variant of the key
         *     that matched.
         */
        getValueSpellingVariants: function(obj, commonVariants, variantRe) {
            var foundValue = undefined;
            if (!obj) {
                return foundValue; // nothing to search in passed
            }
            var hasCommonVariants = Ext.isArray(commonVariants);
            var hasVariantRegex = variantRe && variantRe instanceof RegExp;
            if(!hasVariantRegex && !hasCommonVariants) {
                return foundValue; // Neither RegExp nor common variants passed
            }
            if (!hasCommonVariants) {
                commonVariants = [];
            }
            Ext.each(commonVariants, function(commonVariant) {
                if (commonVariant in obj) {
                    foundValue = obj[commonVariant];
                    return false; // exit `Ext.each` early
                }
            });
            if(!Ext.isDefined(foundValue) && hasVariantRegex) {
                // since we did not find a common variant check all keys against
                // the regular expression
                var keys = Ext.Object.getKeys(obj);
                Ext.each(keys, function(key) {
                    if (key && variantRe.test(key)) {
                        foundValue = obj[key];
                        return false; // exit `Ext.each` early
                    }
                });
            }
            return foundValue;
        },

        /**
         * A utility method to get the layers-key from an object which
         * represents URL params. Will first try the keys `LAYERS`, then
         * `layers` and finally all sorts of mixed casing spellings like
         * `lAyERs`.
         *
         * @param {Object} params The object to look in.
         * @return {*} The value for the layers key in the first matched casing
         *     variant
         */
        layersFromParams: function(params) {
            var commonVariants = ['LAYERS', 'layers'];
            var variantRegEx = /^layers$/i;
            return BasiGX.util.Object.getValueSpellingVariants(
                params, commonVariants, variantRegEx
            );
        },

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
            if (queryKey.split('/').length > 1) {
                Ext.each(queryKey.split('/'), function(key) {
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
                    queryMatch = BasiGX.util.Object.getValue(queryKey, value);
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
                            queryMatch = BasiGX.util.Object.getValue(
                                queryKey, val);
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
