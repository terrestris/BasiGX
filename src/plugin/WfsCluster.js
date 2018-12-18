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
 * Plugin used for server-side clustering (e.g. with a GeoServer SQL-View), and
 * client-side styling.
 *
 * @class BasiGX.plugin.WfsCluster
 */
Ext.define('BasiGX.plugin.WfsCluster', {
    extend: 'Ext.plugin.Abstract',

    alias: 'plugin.wfscluster',
    pluginId: 'wfscluster',

    init: function(cmp) {
        var me = this;
        me.setCmp(cmp);

        me.setUpClusterLayers(me.getCmp());
    },

    setUpClusterLayers: function(mapComponent) {
        var me = this;
        var map = mapComponent.getMap();
        var allLayers = BasiGX.util.Layer.getAllLayers(map);
        var clusterLayers = [];

        Ext.each(allLayers, function(layer) {
            if (layer.get('type') === 'WFSCluster') {
                // register visibility listener to load the features when
                // layer is toggled in tree, which is not detected by the
                // maps moveend listener
                // TODO: check why this gets fired 2 times -> geoext?!!
                if (!layer.visibilityListener) {
                    layer.on('change:visible', function(evt) {
                        if (evt.target.getVisible()) {
                            me.loadClusterFeatures(layer);
                        }
                    });
                }
                clusterLayers.push(layer);
                if (layer.get('olStyle')) {
                    layer.setStyle(layer.get('olStyle'));
                } else {
                    layer.setStyle(me.clusterStyleFuntion);
                }
            }
        });

        if (clusterLayers.length > 0) {
            // on every map move
            map.on('moveend', function() {
                me.loadClusterFeatures(clusterLayers);
            }, me);
        }
    },

    clusterStyleFuntion: function(feature) {
        var layerName;
        if (feature.getId()) {
            layerName = feature.getId().split('.')[0];
        } else {
            layerName = feature.get('layerName');
        }

        var layer = BasiGX.util.Layer.getLayerByName(layerName);
        var count = feature.get('count');
        var radius;
        var fontSize;

        if (count > 10) {
            radius = 25;
            fontSize = 14;
        } else if (count < 4) {
            fontSize = 7;
            radius = 8;
        } else {
            radius = count * 2;
            fontSize = count * 1.3;
        }
        return [
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    // opacity: 0.6,
                    fill: new ol.style.Fill({
                        color: layer.get('clusterColorString')
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray'
                    })
                }),
                text: new ol.style.Text({
                    text: count > 1 ? count.toString() : '',
                    font: 'bold ' + fontSize * 2 + 'px Arial',
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    fill: new ol.style.Fill({color: 'white'})
                })
            })
        ];
    },

    /**
     * The wfscluster layerType expects a geoserver view which handles
     * clustering with database methods.
     *
     * @param {Array<ol.layer.Vector>} clusterLayers The layers to cluster.
     */
    loadClusterFeatures: function(clusterLayers) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();

        if (map && map.getView() && map.getView().getResolution() &&
            map.getSize()) {
            var res = map.getView().getResolution();
            var extent = map.getView().calculateExtent(map.getSize());
            // the factor which describes the distance used
            // to decide when to cluster. Unit is very
            // roughly ~meters.
            var factor = Math.round(res * 70);

            // when reaching the lower limit of 250, reduce /
            // disable clustering to see the real features
            if (factor < 250) {
                factor = 1;
            }
            Ext.each(clusterLayers, function(layer) {
                if (layer.getVisible()) {
                    var featureType = layer.get('featureType');
                    var baseUrl = layer.get('url');
                    Ext.Ajax.request({
                        url: baseUrl + '?service=WFS&' +
                            'version=1.0.0&' +
                            'request=GetFeature&' +
                            'typeName=' + featureType + '&' +
                            // TODO portability, e.g. UMN mapserver might have
                            // sth. else (if at all…)
                            'outputFormat=application/json&' +
                            'bbox=' + extent.join(',') + '&' +
                            'viewParams=resolutioninm:' + factor + ';' +
                            'bboxllx:' + extent[0] + ';' +
                            'bboxlly:' + extent[1] + ';' +
                            'bboxurx:' + extent[2] + ';' +
                            'bboxury:' + extent[3],
                        success: function(response) {
                            var feats = response.responseText;
                            var f = new ol.format.GeoJSON().readFeatures(feats);
                            layer.getSource().clear();
                            layer.getSource().addFeatures(f);
                        },
                        failure: function() {
                            var msg = 'Failure on load of cluster features';
                            Ext.log.error(msg);
                        }
                    });
                }
            });
        }
    }
});
