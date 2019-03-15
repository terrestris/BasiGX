/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * Shows a layer preview window.
 *
 * @class BasiGX.view.window.PreviewWindow
 */
Ext.define('BasiGX.view.window.PreviewWindow', {
    extend: 'Ext.window.Window',

    closeAction: 'hide',

    constrain: true,

    config: {
        projection: 'EPSG:3857',
        center: [1095801, 6726458],
        zoom: 3,
        dataExtent: [[10000, 20000], [20000, 40000]]
    },

    tools: [{
        type: 'gear',
        handler: function() {
            this.up('window').showLegend();
        }
    }],

    /**
     * Sets up the map and the controls.
     */
    initComponent: function() {
        this.callParent();
        var markup = '<i class="fa fa-globe" aria-hidden="true"></i>';
        var worldIcon = Ext.dom.Helper.createDom(markup);
        var controls = [
            new ol.control.Zoom(),
            new ol.control.ZoomToExtent({
                label: worldIcon
            })
        ];
        if (this.getDataExtent()) {
            markup = '<i class="fa fa-asterisk" aria-hidden="true"></i>';
            worldIcon = Ext.dom.Helper.createDom(markup);
            controls.push(this.extentControl = new ol.control.ZoomToExtent({
                className: 'basigx-zoom-to-data-extent',
                label: worldIcon,
                extent: ol.extent.boundingExtent(this.getDataExtent())
            }));
        }
        this.add({
            xtype: 'gx_component_map',
            width: 400,
            height: 400,
            map: this.map = new ol.Map({
                controls: controls,
                view: new ol.View({
                    center: this.getCenter(),
                    zoom: this.getZoom(),
                    projection: this.getProjection()
                })
            })
        });
        this.map.on('singleclick', this.mapClicked.bind(this));
    },

    mapClicked: function(event) {
        var me = this;
        var mapView = this.map.getView();
        var resolution = mapView.getResolution();
        var projCode = mapView.getProjection().getCode();
        var url = this.layer.getSource().getGetFeatureInfoUrl(
            event.coordinate,
            resolution,
            projCode,
            {
                'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': 100
            }
        );
        Ext.Ajax.request({
            url: url,
            success: function(response) {
                var collection = JSON.parse(response.responseText);
                if (collection.features.length > 0) {
                    var mapComponent = me.down('gx_component_map');
                    var fmt = new ol.format.GeoJSON();
                    var features = fmt.readFeatures(collection);
                    var vectorLayer = new ol.layer.Vector({
                        source: new ol.source.Vector({features: features})
                    });
                    var win = Ext.create('Ext.window.Window', {
                        title: me.getTitle(),
                        layout: 'fit',
                        width: 500,
                        height: 500,
                        bodyPadding: 5,
                        items: [{
                            xtype: 'basigx-grid-featuregrid',
                            layout: 'fit',
                            layer: vectorLayer,
                            map: mapComponent,
                            title: false,
                            hideHeader: true
                        }]
                    }).show();
                    win.down('grid').getHeader().hide();
                }
            }
        });
    },

    /**
     * Call this to update the preview with a different layer.
     *
     * @param {ol.layer.Layer} layer the layer
     * @param {Object} config the SHOGun configuration object
     */
    setLayer: function(layer, config) {
        this.layer = layer;
        this.layerConfig = config;
        this.map.getLayers().clear();
        this.map.addLayer(layer);
    },

    /**
     * Call this with coordinates to update the data extent.
     *
     * @param {array[]} dataExtent the coordinates, e.g. [[-1, -1], [1, 1]]
     */
    setDataExtent: function(dataExtent) {
        var markup = '<i class="fa fa-asterisk" aria-hidden="true"></i>';
        var worldIcon = Ext.dom.Helper.createDom(markup);
        this.dataExtent = dataExtent;
        if (this.extentControl) {
            this.map.removeControl(this.extentControl);
            this.map.addControl(
                this.extentControl = new ol.control.ZoomToExtent({
                    className: 'basigx-zoom-to-data-extent',
                    label: worldIcon,
                    extent: ol.extent.boundingExtent(this.getDataExtent())
                }));
        }
    },

    /**
     * This is called internally to show the legend, if any.
     */
    showLegend: function() {
        if (!this.layerConfig) {
            return;
        }
        var url = this.layerConfig.source.url;
        if (!url.startsWith('http')) {
            url = window.origin + url;
        }
        var params = {
            request: 'GetLegendGraphic',
            service: 'WMS',
            version: '1.1.1',
            format: 'image/png',
            layer: this.layerConfig.source.layerNames
        };
        url += '?' + Ext.Object.toQueryString(params);
        Ext.create('Ext.window.Window', {
            title: this.getTitle(),
            layout: 'fit',
            minWidth: 200,
            minHeight: 200,
            bodyPadding: 5,
            items: [{
                html: '<img alt="' + this.getTitle() + '" src="' +
                    url + '"></img>'
            }]
        }).show();
    }

});
