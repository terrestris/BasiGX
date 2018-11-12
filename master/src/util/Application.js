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
 * Application Util
 *
 * Some methods to work with application
 *
 * @class BasiGX.util.Application
 */
Ext.define('BasiGX.util.Application', {

    requires: [
        'BasiGX.util.Layer',
        'BasiGX.util.Map'
    ],

    statics: {
        /**
         * Returns the application context object for the BasiGX map component
         * defined by the passed `mapComponentXType`.
         *
         * @param {String} mapComponentXType The `xtype` of the component to
         *     check. Will often be different than the `xtype` of the parent
         *     class `BasiGX.component.Map` (e.g. when sub classing for
         *     projects).
         * @return {Object} The application context or `null`.
         */
        getAppContext: function(mapComponentXType) {
            var mapComp = BasiGX.util.Map.getMapComponent(mapComponentXType);

            if (mapComp && mapComp.appContext) {
                return mapComp.appContext.data.merge;
            } else {
                return null;
            }
        },

        /**
         * Gets a route for the current map of the component with the passed
         * `mapComponentXType`.
         *
         * @param {String} mapComponentXType The `xtype` of the component to
         *     check. Will often be different than the `xtype` of the parent
         *     class `BasiGX.component.Map` (e.g. when sub classing for
         *     projects).
         * @return {String} A route for the for the current map of the
         *     component with the passed `mapComponentXType`
         */
        getRoute: function(mapComponentXType) {
            var mapComp = BasiGX.util.Map.getMapComponent(mapComponentXType);
            var map = mapComp.getMap();
            var zoom = map.getView().getZoom();
            var center = map.getView().getCenter().toString();
            var visibleLayers = BasiGX.util.Layer.getVisibleLayers(map);
            var visibleLayerRoutingIds = [];

            Ext.each(visibleLayers, function(layer) {
                visibleLayerRoutingIds.push(layer.get('routingId'));
            });

            var hash = 'center/' + center +
                       '|zoom/' + zoom +
                       '|layers/' + visibleLayerRoutingIds.toString();

            return hash;
        }
    }
});
