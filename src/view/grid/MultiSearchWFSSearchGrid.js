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
 *  A grid showing results of the multisearch WFS search response values.
 *  inspired by BasiGX.view.container.WfsSearch
 *  This class is used by BasiGX.view.form.field.MultiSearchCombo
 *
 * @class BasiGX.view.grid.MultiSearchWFSSearchGrid
 *
 * @extends Ext.grid.Panel
 *
 * @requires GeoExt.component.FeatureRenderer
 * @requires GeoExt.data.store.Features
 * @requires BasiGX.util.Map
 * @requires BasiGX.util.Layer
 * @requires BasiGX.util.Animate
 *
 */
Ext.define('BasiGX.view.grid.MultiSearchWFSSearchGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'basigx-grid-multisearchwfssearchgrid',

    requires: [
        'GeoExt.component.FeatureRenderer',
        'GeoExt.data.store.Features',
        'BasiGX.util.Map',
        'BasiGX.util.Layer',
        'BasiGX.util.Animate'
    ],

    viewModel: {
        data: {
            title: 'Objektsuche'
        }
    },

    bind: {
        title: '{title}'
    },

    store: null,

    cls: 'search-result-grid',

    searchResultVectorLayer: null,

    collapsible: true,

    titleCollapse: true,

    collapseDirection: 'top',

    headerPosition: 'left',

    hideHeaders: true,

    maxHeight: 180,

    config: {

        combo: null,

        minSearchTextChars: 3,

        typeDelay: 300,

        allowedFeatureTypeDataTypes: [
            'xsd:string'
        ],

        searchTerm: null,

        map: null,

        layer: null,

        searchResultFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#4990D1'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            stroke: new ol.style.Stroke({
                color: '#4990D1',
                width: 4
            })
        }),

        searchResultHighlightFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: '#EE0000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            stroke: new ol.style.Stroke({
                color: '#EE0000',
                width: 6
            })
        }),

        /**
         *
         */
        searchResultSelectFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({
                    color: '#EE0000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            stroke: new ol.style.Stroke({
                color: '#EE0000',
                width: 8
            })
        }),

        flashStyle: function() {
            return [new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5
                })
            })];
        }

    },


    /**
    *
    */
    features: [{
        ftype: 'grouping',
        groupHeaderTpl: 'Layer: {name}'
    }],

    /**
    *
    */
    columns: [
        /**
               * @todo gx_renderer doesn't render all features every time
               */
        //    {
        //        xtype: 'widgetcolumn',
        //        flex: 1,
        //        widget: {
        //            xtype: 'gx_renderer'
        //        },
        //        onWidgetAttach: function(column, gxRenderer, record) {
        //            // update the symbolizer with the related feature
        //            var feature = record.getFeature();
        //            gxRenderer.update({
        //                feature: feature,
        //                symbolizers: this.up('grid')
        // .getSearchResultFeatureStyle()
        //            });
        //        }
        //    },
        {
            text: 'Feature',
            dataIndex: 'displayfield',
            flex: 5,
            renderer: function(value) {
                return '<span data-qtip="' + value + '">' +
                value + '</span>';
            }
        }
    ],

    /**
    *
    */
    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.map = BasiGX.util.Map.getMapComponent().getMap();

        if (!me.searchResultVectorLayer) {
            me.searchResultVectorLayer = new ol.layer.Vector({
                name: 'Object Search Results',
                source: new ol.source.Vector(),
                style: me.getSearchResultFeatureStyle(),
                hoverable: false
            });

            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            me.searchResultVectorLayer.set(displayInLayerSwitcherKey, false);
            me.map.addLayer(me.searchResultVectorLayer);
        }

        var searchResultStore = Ext.create('GeoExt.data.store.Features', {
            map: me.map,
            layer: me.searchResultVectorLayer,
            groupField: 'featuretype'
        });

        me.setStore(searchResultStore);


        me.on('describeFeatureTypeResponse', me.getFeatures);
        me.on('getFeatureResponse', me.showSearchResults);

        me.on('boxready', me.onBoxReady, me);

        // add listeners for interaction between grid and found features
        // while grid is visible
        me.on('afterrender', me.registerListeners, me);
        me.on('show', me.registerListeners, me);

        // unregister the same listeners on grid hide
        me.on('hide', me.unregisterListeners, me);
        me.on('destroy', me.unregisterListeners, me);

    },

    /**
     * Called once the grid is shown. Registers all related listeners for
     * interaction between grid and features on the map.
     */
    registerListeners: function() {
        var me = this;
        me.on('itemmouseenter', me.highlightFeature, me);
        me.on('itemmouseleave', me.unhighlightFeature, me);
        me.on('itemclick', me.highlightSelectedFeature, me);
    },

    /**
     * Called once the grid turns hidden. Deactivates all related listeners for
     * interaction between grid and features on the map.
     */
    unregisterListeners: function () {
        var me = this;
        me.un('itemmouseenter', me.highlightFeature, me);
        me.un('itemmouseleave', me.unhighlightFeature, me);
        me.un('itemclick', me.highlightSelectedFeature, me);
    },


    /**
     * Called by BasiGX.view.form.field.MultiSearchCombo.doObjectSearch()
     * This method starts the search by requesting the WFS-DescribyFeatureType
     * for all wanted layers.
     *
     * @param {string} searchterm The search term
     * @param {Ext.form.field.Combo} combo The calling combobox to set it on the
     *     WFSGrid
     */
    describeFeatureTypes: function(searchterm, combo) {
        var me = this;
        var typeNames = [];
        var featureTypes;

        me.searchResultVectorLayer.getSource().clear();

        me.setSearchTerm(searchterm);

        me.setCombo(combo);

        var searchLayers = combo.getConfiguredSearchLayers();

        Ext.each(searchLayers, function(l) {
            if (l.getSource().getParams) {
                typeNames.push(l.getSource().getParams().LAYERS);
            }
        });

        var describeFeatureTypeParams = {
            REQUEST: 'DescribeFeatureType',
            SERVICE: 'WFS',
            VERSION: '1.1.0',
            OUTPUTFORMAT: 'application/json',
            TYPENAME: typeNames.toString()
        };

        me.setLoading(true);

        Ext.Ajax.request({
            url: combo.getWfsServerUrl(),
            params: describeFeatureTypeParams,
            method: 'GET',
            success: function(response) {
                me.setLoading(false);
                if (Ext.isString(response.responseText)) {
                    featureTypes = Ext.decode(response.responseText);
                } else if (Ext.isObject(response.responseText)) {
                    featureTypes = response.responseText;
                } else {
                    Ext.log.error('Error! Could not parse ' +
                        'describe featuretype response!');
                }
                me.fireEvent('describeFeatureTypeResponse', featureTypes);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error('Error on describe featuretype request:',
                    response);
            }
        });
    },

    /**
     * Called by describeFeatureTypeResponse event fired by successfull
     * describeFeatureTypes() response.
     *
     * This method requests the actual features fitting to the search term.
     *
     * @param {Object} resp The ajax response containing DescribeFeatureType.
     */
    getFeatures: function(resp) {
        var me = this;
        var featureTypes = resp.featureTypes;
        var cleanedFeatureType = me.cleanUpFeatureDataTypes(featureTypes);
        var url = me.getCombo().getWfsServerUrl();
        var xml = me.setupXmlPostBody(cleanedFeatureType);
        var features;

        me.setLoading(true);

        Ext.Ajax.request({
            url: url,
            method: 'POST',
            headers: BasiGX.util.CSRF.getHeader(),
            xmlData: xml,
            success: function(response) {
                me.setLoading(false);
                if (Ext.isString(response.responseText)) {
                    features = Ext.decode(response.responseText).features;
                } else if (Ext.isObject(response.responseText)) {
                    features = response.responseText.features;
                } else {
                    Ext.log.error('Error! Could not parse ' +
                        'GetFeature response!');
                }
                me.fireEvent('getFeatureResponse', features);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error('Error on GetFeature request:',
                    response);
            }
        });
    },

    /**
     * This method removes unwanted dataTypes from the passed ones.
     *
     * Called by getFeatures() for less vulnerability
     *
     * @param {Array<Object>} featureTypes The featuretypes.
     * @return {Array<Object>} The wanted typenames.
     */
    cleanUpFeatureDataTypes: function(featureTypes) {
        var me = this;
        var cleanedFeatureType = [];
        Ext.each(featureTypes, function(ft, index) {
            cleanedFeatureType.push({
                typeName: ft.typeName,
                properties: []
            });

            Ext.each(ft.properties, function(prop) {
                if (Ext.Array.contains(
                    me.getAllowedFeatureTypeDataTypes(), prop.type) &&
                    prop.name.indexOf(' ') < 0) {
                    cleanedFeatureType[index].properties.push(prop);
                }
            });
        });
        return cleanedFeatureType;
    },

    /**
     * Sets up a XML as string for a 'wfs:GetFeature'-operation.
     *
     * Called by #getFeatures to build the POST Body. It decides if the search
     * should be done in the visible extent only.
     *
     * @param {Array<Object>} featureTypes The featuretypes.
     * @return {String} The XML.
     */
    setupXmlPostBody: function(featureTypes) {
        var me = this;
        var combo = me.getCombo();
        var limitToBBox = combo.getLimitToBBox();
        var map = BasiGX.util.Map.getMapComponent().getMap();
        var projection = map.getView().getProjection().getCode();
        var bbox;
        var visibleExtent = map.getView().calculateExtent(map.getSize());
        var totalExtent = map.getView().getProjection().getExtent();
        var maxFeatures = combo.getMaxFeatures();

        if (limitToBBox) {
            bbox = visibleExtent;
        } else {
            bbox = totalExtent;
        }

        var bboxll = bbox[0] + ' ' + bbox[1];
        var bboxur = bbox[2] + ' ' + bbox[3];

        var xml =
            '<wfs:GetFeature service="WFS" version="1.1.0" ' +
              'outputFormat="application/json" ' +
              'maxFeatures="' + maxFeatures + '" ' +
              'xmlns:wfs="http://www.opengis.net/wfs" ' +
              'xmlns:ogc="http://www.opengis.net/ogc" ' +
              'xmlns:gml="http://www.opengis.net/gml" ' +
              'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
              'xsi:schemaLocation="http://www.opengis.net/wfs ' +
              'http://schemas.opengis.net/wfs/1.1.0/WFS-basic.xsd">';

        Ext.each(featureTypes, function(ft) {
            Ext.each(ft.properties, function(prop) {
                xml +=
                    '<wfs:Query typeName="' + me.getCombo().getWfsPrefix() +
                           ft.typeName + '">' +
                     '<ogc:Filter>' +
                      '<ogc:And>' +
                       '<ogc:BBOX>' +
                        '<gml:Envelope srsName="' + projection + '">' +
                         '<gml:lowerCorner>' + bboxll + '</gml:lowerCorner>' +
                         '<gml:upperCorner>' + bboxur + '</gml:upperCorner>' +
                        '</gml:Envelope>' +
                       '</ogc:BBOX>' +
                       '<ogc:PropertyIsLike wildCard="*" singleChar="."' +
                        ' escape="\\" matchCase="false">' +
                        '<ogc:PropertyName>' +
                         prop.name +
                        '</ogc:PropertyName>' +
                        '<ogc:Literal>' +
                         '*' + me.searchTerm + '*' +
                         '</ogc:Literal>' +
                       '</ogc:PropertyIsLike>' +
                      '</ogc:And>' +
                     '</ogc:Filter>' +
                   '</wfs:Query>';
            });
        });

        xml += '</wfs:GetFeature>';

        return xml;
    },

    /**
     * This method parses the features and adds them to the store to show the
     * search results in the grid.
     *
     * Called by getFeatureResponse event fired by successfull response of
     * the method #getFeatures.
     *
     * @param {Array<ol.Feature>} features The features.
     */
    showSearchResults: function(features) {
        var me = this;
        var combo = me.getCombo();
        var parser = new ol.format.GeoJSON();

        if (!features) {
            Ext.log.error('No feature found');
        } else {
            if (features.length === 0) {
                me.hide();
                combo.noWfsSearchResults = true;
            } else {
                me.show();
                combo.noWfsSearchResults = false;

                var searchTerm = me.searchTerm;
                Ext.each(features, function(feature) {
                    var featuretype = feature.id.split('.')[0];
                    var displayfield;

                    // find the matching value in order to display it
                    Ext.iterate(feature.properties, function(k, v) {
                        var lcVal = v && v.toString().toLowerCase();
                        if (lcVal && lcVal.indexOf(searchTerm) > -1) {
                            displayfield = v;
                            return false;
                        }
                    });

                    feature.properties.displayfield = displayfield;
                    feature.properties.featuretype = featuretype;

                    var olFeat = parser.readFeatures(feature, {
                        dataProjection: combo.getWfsDataProjection(),
                        featureProjection: combo.getWfsFeatureProjection()
                    })[0];
                    me.searchResultVectorLayer.getSource().addFeature(olFeat);

                });
            }
            combo.fireEvent('checkresultsvisibility');
        }
    },

    /**
    * called by OnBoxready listener to add search layer
    */
    onBoxReady: function() {
        var me = this;
        if (!me.getMap()) {
            var map = BasiGX.util.Map.getMapComponent().getMap();
            me.setMap(map);
        }
        if (!me.getLayer()) {
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            layer.set(displayInLayerSwitcherKey, false);
            me.setLayer(layer);
            me.getMap().addLayer(layer);
        }
    },

    /**
     * Called by onitemmouseenter listener to highlight the hovered search
     * results on the map.
     *
     * @param {Ext.grid.Panel} tableView The grid panel (`Ext.view.View`).
     * @param {Ext.data.Model} record The record that belongs to the item.
     */
    highlightFeature: function(tableView, record) {
        var me = this;
        var layer = me.getLayer();
        layer.getSource().clear();

        var feature = record.getFeature();

        if (feature) {
            this.flashListenerKey = BasiGX.util.Animate.flashFeature(
                feature, 1000);
            feature.setStyle(me.getSearchResultHighlightFeatureStyle());
            layer.getSource().addFeature(feature);
        }
    },

    /**
     * Called by onitemmouseleave listener to unhighlight the search
     * results on the map.
     *
     * @param {Ext.grid.Panel} tableView The grid panel (`Ext.view.View`).
     * @param {Ext.data.Model} record The record that belongs to the item.
     */
    unhighlightFeature: function(tableView, record) {
        var me = this;
        var layer = me.getLayer();
        layer.getSource().clear();

        var feature = record.getFeature();

        if (feature) {
            feature.setStyle(me.getSearchResultFeatureStyle());
        }

    },

    /**
     * Called by onitemclick listener to center map on clicked item.
     *
     * @param {Ext.grid.Panel} tableView The grid panel (`Ext.view.View`).
     * @param {Ext.data.Model} record The record that belongs to the item.
     */
    highlightSelectedFeature: function(tableView, record) {
        var me = this;
        var layer = me.getLayer();
        var feature = record.getFeature();
        var extent;
        var x;
        var y;

        layer.getSource().clear();

        if (feature) {
            feature.setStyle(me.getSearchResultSelectFeatureStyle());
            layer.getSource().addFeature(feature);
            extent = feature.getGeometry().getExtent();
            x = extent[0] + (extent[2] - extent[0]) / 2;
            y = extent[1] + (extent[3] - extent[1]) / 2;

            me.getMap().getView().setCenter([x, y]);
        }

    }

});
