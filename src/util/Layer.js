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
 *
 * A utility class offering static methods to work with OpenLayers layers.
 *
 * @class BasiGX.util.Layer
 */
Ext.define('BasiGX.util.Layer', {
    requires: [
        'BasiGX.util.Map',
        'BasiGX.util.Object'
    ],
    statics: {
        /**
         * A name of a boolean property that utility layers should set to an
         * appropriate value (often `false`). The layer displaying components
         * usually read out the property and determine whether to show an entry
         * for the particular layer in question.
         *
         * TODO It should be safe to change the property to e.g.
         *     `'basigx-displayInLayerSwitcher'`, but we'll keep it as is for
         *     backwards compatibility for now.
         */
        KEY_DISPLAY_IN_LAYERSWITCHER: 'bp_displayInLayerSwitcher',

        /**
         * The name of a layer used for drawing measurements on. Can be used to
         * dynamically determine that particular layer.
         */
        NAME_MEASURE_LAYER: 'basigx-measure-layer',

        /**
         * Get an ol-layer by the given key-value constellation.
         *
         * @param {String} key - the layer's property name
         * @param {String} val - the layer's property value for the given key
         * @param {ol.Collection} collection - optional collection to search in
         * @return {ol.Layer} matchingLayer - the ol-layer
         */
        getLayerBy: function(key, val, collection) {
            var me = this;
            var matchingLayer;
            var layers;

            if (!Ext.isEmpty(collection)) {
                layers = collection.getArray ?
                    collection.getArray() : collection;
            } else {
                var map = BasiGX.util.Map.getMapComponent().getMap();
                layers = map.getLayers().getArray();
            }

            Ext.each(layers, function(layer) {
                if (matchingLayer) {
                    return false;
                }
                if (layer.get(key) === val &&
                    layer instanceof ol.layer.Base) {
                    matchingLayer = layer;
                    return false;
                } else if (layer instanceof ol.layer.Group) {
                    matchingLayer = me.getLayerBy(key, val, layer.getLayers());
                }
            });
            return matchingLayer;
        },

        /**
         * Returns the layer matching the given qualified layer name.
         *
         * @param {String} layersParam The (qualified) layers param,
         *  e.g. 'foo:bar'
         * @param {ol.Map} map The OpenLayers map to get the layers from.
         *
         * @return {ol.layer.Layer} The OpenLayers layer from the map (if it
         *  could be found).
         */
        getLayerByLayersParam: function(layersParam, map) {
            if (!map) {
                map = BasiGX.util.Map.getMapComponent().getMap();
            }
            var ObjectUtil = BasiGX.util.Object;
            var mapLayers = map.getLayers();
            var olLayer;
            var foundIt = false;

            var checkForLayersParam = function(layer) {
                if (foundIt === true) {
                    return;
                }
                if (layer instanceof ol.layer.Layer &&
                    (layer.getSource() instanceof ol.source.TileWMS
                    || layer.getSource() instanceof ol.source.ImageWMS)) {

                    var params = layer.getSource().getParams();
                    if (ObjectUtil.layersFromParams(params) === layersParam) {
                        olLayer = layer;
                        foundIt = true;
                    }
                } else if (layer instanceof ol.layer.Group) {
                    var groupLayers = layer.getLayers();

                    // recursive call for the layers in the layer group
                    groupLayers.forEach(checkForLayersParam);
                }
            };
            mapLayers.forEach(checkForLayersParam);
            return olLayer;
        },

        /**
         * Returns the list of layers matching the given pair of properties.
         *
         * @param {String} key - the layers property name
         * @param {String} value - the layers property value for the given key
         * @param {ol.Collection} collection - optional collection to search in
         *
         * @return {ol.layer.Base[]} The array of matching layers.
         */
        getLayersBy: function(key, value, collection) {
            if (!key) {
                return [];
            }
            var me = this;
            var matchingLayers = [];
            var layers;

            if (!Ext.isEmpty(collection)) {
                layers = collection.getArray ?
                    collection.getArray() : collection;
            } else {
                var map = BasiGX.util.Map.getMapComponent().getMap();
                layers = map.getLayers().getArray();
            }

            Ext.each(layers, function(layer) {
                if (layer.get(key) === value &&
                    layer instanceof ol.layer.Base) {
                    matchingLayers.push(layer);
                } else if (layer instanceof ol.layer.Group) {
                    matchingLayers = Ext.Array.merge(matchingLayers,
                        me.getLayersBy(key, value, layer.getLayers()));
                }
            });
            return matchingLayers;
        },

        /**
         * Get an ol-layer by the given name.
         *
         * @param {String} layername - the layers name
         * @param {ol.Collection} collection - optional collection to search in
         * @return {ol.Layer} matchingLayer - the ol-layer
         */
        getLayerByName: function(layername, collection) {
            return this.getLayerBy('name', layername, collection);
        },

        /**
         * Gets an ol-layer by the given featureType.
         *
         * @param {String} featureType - the layers featureType
         * @param {ol.Collection} collection - optional collection to search in
         * @return {ol.Layer} matchingLayer - the ol-layer
         */
        getLayerByFeatureType: function(featureType, collection) {
            var me = this;
            var matchingLayer;
            var layers;

            if (!Ext.isEmpty(collection)) {
                layers = collection.getArray ?
                    collection.getArray() : collection;
            } else {
                var map = BasiGX.util.Map.getMapComponent().getMap();
                layers = map.getLayers().getArray();
            }

            Ext.each(layers, function(layer) {
                if (matchingLayer) {
                    return false;
                }
                if (layer.get('featureType') &&
                   layer.get('featureType') === featureType) {
                    matchingLayer = layer;

                    return false;
                } else if (layer.getSource &&
                    layer.getSource().getParams &&
                    layer.getSource().getParams().LAYERS === featureType &&
                    layer instanceof ol.layer.Base) {
                    matchingLayer = layer;

                    return false;
                } else if (layer instanceof ol.layer.Group) {
                    matchingLayer = me.getLayerByFeatureType(
                        featureType, layer.getLayers());
                }
            });
            return matchingLayer;
        },


        /**
         * Returns all layers of an map. Even the hidden ones.
         *
         * @param {ol.Map} map The OpenLayers map to get the layers from.
         * @return {Array} An array of all Layers.
         */
        getAllLayers: function(map) {
            if (!map) {
                map = BasiGX.util.Map.getMapComponent().getMap();
            }
            var layers = map.getLayers();
            var me = this;
            var allLayers = [];

            layers.forEach(function(layer) {
                if (layer instanceof ol.layer.Group) {
                    Ext.each(me.getAllLayers(layer),
                        function(layeri) {
                            allLayers.push(layeri);
                        });
                }
                allLayers.push(layer);
            });
            return allLayers;
        },

        /**
         * Returns all visible layers of an map.
         *
         * @param {ol.layerCollection|ol.Map} collection Either a collection
         *     of layers or an `OpenLayers.Map`.
         * @return {Array} An array of the visible layers.
         */
        getVisibleLayers: function(collection) {
            var me = this;
            var layers = me.getAllLayers(collection);
            var visibleLayers = [];

            Ext.each(layers, function(layer) {
                if (layer.get('visible') &&
                    layer.get('routingId') &&
                    !layer.get('isSliderLayer')) {
                    visibleLayers.push(layer);
                }
            });

            return visibleLayers;
        },

        /**
         * Cascades down a given LayerGroup, calling the given function for
         * each LayerGroup / Layer.
         *
         * @param  {ol.layer.Group} lyrGroup The layer group to cascade down
         * @param  {Function} fn A function to call on every LayerGroup / Layer
         * @return {void}
         */
        cascadeLayers: function(lyrGroup, fn) {
            if (!(lyrGroup instanceof ol.layer.Group)) {
                // skip on wrong input type
                Ext.Logger.warn(
                    'No ol.layer.Group given to ' +
                    'BasiGX.util.Layer.cascadeLayers. It is unlikely that ' +
                    'this will work properly. Skipping!');
                return;
            }
            if(!Ext.isFunction(fn)){
                Ext.Logger.warn(
                    'No function passed ' +
                    'this will not work. Skipping!');
                return;
            }

            lyrGroup.getLayers().forEach(function(layerOrGroup) {
                fn(layerOrGroup);
                if (layerOrGroup instanceof ol.layer.Group) {
                    BasiGX.util.Layer.cascadeLayers(layerOrGroup, fn);
                }
            });
        }
    }
});
