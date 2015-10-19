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
 * Application Util
 *
 * Some methods to work with application
 *
 */
Ext.define('BasiGX.util.Application', {

    requires: ['BasiGX.util.Layer'],

    statics: {

        getAppContext: function(){
            var mapComponent = Ext.ComponentQuery
                .query('basigx-component-map')[0];

            if(mapComponent && mapComponent.appContext){
                return mapComponent.appContext.data.merge;
            } else {
                return null;
            }
        },

        getRoute: function(){
                var mapComponent = Ext.ComponentQuery
                    .query('basigx-component-map')[0];
                var map = mapComponent.getMap();
                var zoom = map.getView().getZoom();
                var center = map.getView().getCenter().toString();
                var visibleLayers = BasiGX.util.Layer
                    .getVisibleLayers(map);
                var visibleLayerRoutingIds = [];

                Ext.each(visibleLayers, function(layer){
                    visibleLayerRoutingIds.push(layer.get('routingId'));
                });

                var hash = 'center/' + center +
                           '|zoom/' + zoom +
                           '|layers/' + visibleLayerRoutingIds.toString();

                return hash;
        }
    }
});
