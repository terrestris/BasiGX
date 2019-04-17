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
 * Namespace utility.
 *
 * @class BasiGX.util.Namespace
 */
Ext.define('BasiGX.util.Namespace', {

    inheritableStatics: {
        /**
         * An object with all namespaces as keys, and their respective namespace
         * URI as value.
         *
         * Filled in the on class defined function.
         *
         * @type {Object}
         */
        namespaces: null,

        /**
         * An object with all namespace URIs as keys, and their respective
         * namespace as value.
         *
         * Filled in the on class defined function.
         *
         * @type {Object}
         */
        namespaceUris: null,

        /**
         * Get the URI of a namespace by it's alias / name.
         *
         * @param {String} namespace The namespace alias / name, e.g. 'yourapp'.
         * @return {String} The URI for that alias / name, e.g.
         *     'http://tomcat:8080/yourapp'.
         */
        namespaceUriFromNamespace: function(namespace) {
            var staticMe = BasiGX.util.Namespace;
            var nsUri = '';
            if (namespace in staticMe.namespaces) {
                nsUri = staticMe.namespaces[namespace];
            }
            return nsUri;
        },

        /**
         * Get the namespace alias / name by it's namespace URI.
         *
         * @param {String} nsUri The namespace URI to get the alias /
         *     name for, e.g. 'http://tomcat:8080/yourapp'.
         * @return {String} The namespace alias / name, e.g.
         *     'yourapp'.
         */
        namespaceFromNamespaceUri: function(nsUri) {
            var staticMe = BasiGX.util.Namespace;
            var ns = '';
            if (nsUri in staticMe.namespaceUris) {
                ns = staticMe.namespaceUris[nsUri];
            }
            return ns;
        },

        /**
         * Get the namespace from a qualified featureType.
         *
         * @param {String} featureType The featureType,
         *  e.g. 'yourapp:somelayer'.
         * @return {String}  The namespace alias / name, e.g.
         *     'yourapp'.
         */
        namespaceFromFeatureType: function(featureType) {
            return (featureType || '').split(':')[0];
        },

        /**
         * Get the namespace URI from a qualified featureType.
         *
         * @param {String} featureType The featureType,
         *  e.g. 'yourapp:somelayer'.
         * @return {String} The namespace URI for the featureType,
         *      e.g. 'http://tomcat:8080/yourapp'.
         */
        namespaceUriFromFeatureType: function(featureType) {
            var staticMe = BasiGX.util.Namespace;
            var namespace = staticMe.namespaceFromFeatureType(featureType);
            return staticMe.namespaceUriFromNamespace(namespace);
        },

        /**
         * Sets up the internally used objects which link namespaces to their
         * URIs and vice-versa. Called directly after this class is defined, and
         * you usually should not need to call it yourself.
         *
         * @param {Object} namespaces An object of namespaces.
         * @private
         */
        setup: function(namespaces) {
            var staticMe = BasiGX.util.Namespace;

            staticMe.namespaces = namespaces;
            staticMe.namespaceUris = {};

            Ext.iterate(staticMe.namespaces, function(namespace, uri) {
                staticMe.namespaceUris[uri] = namespace;
            });
        }
    }
});
