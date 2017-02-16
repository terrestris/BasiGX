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
 * WFS Search
 *
 * Used to search in multiple featuretypes
 *
 * Example usage:
 *
 *     {
 *         xtype: 'basigx-search-wfs'
 *     }
 *
 * TODO This class has a lot in common with both #NominatimSearch and
 *      the #OverpassSearch. We should factor out shared code.
 *
 * @class BasiGX.view.container.WfsSearch
 */
Ext.define('BasiGX.view.container.WfsSearch', {
    extend: 'Ext.container.Container',
    xtype: 'basigx-search-wfs',

    requires: [
        'GeoExt.data.store.Features',
        'GeoExt.component.FeatureRenderer',

        'BasiGX.util.Animate',
        'BasiGX.util.Map'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            searchTermTextFieldLabel: 'Suchbegriff',
            searchResultGridTitle: 'Suchergebnisse',
            resetBtnText: 'Zurücksetzen'
        }
    },

    /**
     *
     */
    config: {
        /**
         * Array of ol-layers to search in
         */
        layers: [],

        /**
         * The WFS server URL
         */
        wfsServerUrl: null,

        /**
         * minimum chars to trigger the search
         */
        minSearchTextChars: 3,

        /**
         * delay before query gets triggered to avoid triggers while typing
         */
        typeDelay: 300,

        /**
         * the allowed data-types to match against in the describefeaturetype
         * response
         */
        allowedFeatureTypeDataTypes: [
            'xsd:string'
        ],

        /**
         * the template to change the groups titles
         */
        groupHeaderTpl: '{name}',

        /**
         * An `ol.style.Style` for search result features.
         *
         * @type {ol.style.Style}
         */
        searchResultFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#8B0000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#8B0000'
            }),
            stroke: new ol.style.Stroke({
                color: '#8B0000',
                width: 4
            })
        }),

        /**
         * A function generating an `ol.style.Style` for highlighting features.
         *
         * @param {Number} radius The radius of the circle.
         * @param {String} text The text for the style.
         * @return {ol.style.Style} The generated style.
         */
        searchResultHighlightFeatureStyleFn: function(radius, text) {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: '#EE0000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'gray',
                        width: 3
                    })
                }),
                text: text ? new ol.style.Text({
                    text: text.toString(),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    })
                }) : undefined
            });
        },

        /**
         * An `ol.style.Style` for selected search result features.
         *
         * @type {ol.style.Style}
         */
        searchResultSelectFeatureStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: '#0099CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            fill: new ol.style.Fill({
                color: '#0099CC'
            }),
            stroke: new ol.style.Stroke({
                color: '#0099CC',
                width: 6
            })
        }),

        /**
         * Returns an array of styles.
         *
         * TODO Are we accessing a private property here?
         *      `getSource().distance_` => this should be changed.
         *
         * @param {Number} amount The amount.
         * @param {Number} radius The radius.
         * @return {Array<ol.style.Style>} The generated styles.
         */
        clusterStyleFn: function(amount, radius) {
            // set maxradius
            var maxRadius = this.clusterLayer.getSource().distance_ / 2;
            if (radius > maxRadius) {
                radius = maxRadius;
            }
            return [new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    stroke: new ol.style.Stroke({
                        color: '#fff'
                    }),
                    fill: new ol.style.Fill({
                        color: '#3399CC'
                    })
                }),
                text: new ol.style.Text({
                    text: amount.toString(),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    })
                })
            })];
        },

        /**
         * Whether we want to highlight the associated feature in the map when
         * we hover over the row for the feature in the grid.
         *
         * @type {Boolean}
         */
        highLightFeatureOnHoverInGrid: true
    },

    /**
     *
     */
    layout: 'fit',

    /**
     *
     */
    typeDelayTask: null,

    /**
     *
     */
    searchTerm: null,

    /**
     *
     */
    searchResultVectorLayer: null,

    /**
     *
     */
    clusterLayer: null,

    /**
     *
     */
    clusterResults: false,

    /**
     *
     */
    styleCache: [],

    /**
     *
     */
    map: null,

    /**
     *
     */
    initComponent: function() {
        var me = this;

        //set map
        me.map = BasiGX.util.Map.getMapComponent().getMap();

        if (Ext.isEmpty(me.getLayers())) {
            Ext.log.error('No layers given to search component!');
        }

        if (!me.searchResultVectorLayer) {
            me.searchResultVectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: me.getSearchResultFeatureStyle(),
                visible: !me.clusterResults
            });
            me.map.addLayer(me.searchResultVectorLayer);
        }

        if (me.clusterResults && !me.clusterLayer) {
            var clusterSource = new ol.source.Cluster({
                distance: 40,
                source: me.searchResultVectorLayer.getSource()
            });

            me.clusterLayer = new ol.layer.Vector({
                source: clusterSource,
                style: function(feature) {
                    var amount = feature.get('features').length;
                    var style = me.styleCache[amount];
                    if (!style) {
                        style = me.clusterStyleFn(amount, amount + 10);
                        me.styleCache[amount] = style;
                    }
                    return style;
                }
            });
            me.map.addLayer(me.clusterLayer);

            // correct the vectorlayerstyle for the grid symbolizer
            me.searchResultVectorLayer.setStyle(me.clusterStyleFn('', 8));

        }

        var searchResultStore = Ext.create('GeoExt.data.store.Features', {
            map: me.map,
            layer: me.searchResultVectorLayer,
            groupField: 'featuretype'
        });

        me.items = [
            {
                xtype: 'textfield',
                name: 'searchTerm',
                bind: {
                    fieldLabel: '{searchTermTextFieldLabel}'
                },
                enableKeyEvents: true,
                listeners: {
                    change: me.handleKeyDown
                }
            },
            {
                xtype: 'grid',
                name: 'searchresultgrid',
                hidden: true,
                hideHeaders: true,
                bind: {
                    title: '{searchResultGridTitle}'
                },
                store: searchResultStore,
                columns: [
                    {
                        xtype: 'widgetcolumn',
                        flex: 1,
                        widget: {
                            xtype: 'gx_renderer'
                        },
                        onWidgetAttach: function(column, gxRenderer, record) {
                            // update the symbolizer with the related feature
                            var feature = record.olObject;
                            gxRenderer.update({
                                feature: feature,
                                symbolizers: GeoExt.component.FeatureRenderer
                                    .determineStyle(record)
                            });
                        }
                    },
                    {
                        dataIndex: 'displayfield',
                        flex: 7,
                        renderer: function(value) {
                            return '<span data-qtip="' + value + '">' +
                                value + '</span>';
                        }
                    }
                ],
                features: [{
                    ftype: 'grouping',
                    groupHeaderTpl: me.getGroupHeaderTpl()
                }],
                width: 200,
                height: 300
            }, {
                xtype: 'button',
                bind: {
                    text: '{resetBtnText}'
                },
                margin: '10 0 0 0',
                handler: me.resetSearchGridAndText,
                scope: me
            }
        ];
        me.callParent(arguments);

        me.on('describeFeatureTypeResponse', me.getFeatures);
        me.on('getFeatureResponse', me.showSearchResults);
        me.on('show', me.down('textfield').focus);

        var grid = me.down('grid[name=searchresultgrid]');

        if (me.getHighLightFeatureOnHoverInGrid()) {
            grid.on('itemmouseenter', me.highlightFeature, me);
            grid.on('itemmouseleave', me.unhighlightFeature, me);
        }
        grid.on('itemclick', me.highlightSelectedFeature, me);
    },

    /**
     * Bound to the `change`-event of the textfield.
     *
     * @param {Ext.form.field.Text} textfield The textfield in which one enters
     *     the query.
     */
    handleKeyDown: function(textfield) {
        var wfsSearchCont = textfield.up('basigx-search-wfs');
        var val = textfield.getValue();

        if (val.length < wfsSearchCont.getMinSearchTextChars()) {
            return;
        }

        // set the searchterm on component
        wfsSearchCont.searchTerm = val;

        if (wfsSearchCont.typeDelayTask) {
            wfsSearchCont.typeDelayTask.cancel();
        }
        wfsSearchCont.typeDelayTask = new Ext.util.DelayedTask(function() {
            // reset grid from old values
            wfsSearchCont.resetGrid();
            // prepare the describeFeatureType for all given layers
            wfsSearchCont.describeFeatureTypes();
        });
        wfsSearchCont.typeDelayTask.delay(wfsSearchCont.getTypeDelay());

    },

    /**
     *
     */
    resetSearchGridAndText: function() {
        var me = this;
        me.down('textfield[name=searchTerm]').setValue('');
        me.resetGrid();
    },

    /**
     *
     */
    resetGrid: function() {
        var me = this;
        var searchresultgrid = me.down('grid[name=searchresultgrid]');
        me.searchResultVectorLayer.getSource().clear(true);
        searchresultgrid.hide();
        searchresultgrid.getStore().removeAll();
    },

    /**
     * Issues a `DescribeFeatureType` request, so that we know details about the
     * featuretype we are working on.
     */
    describeFeatureTypes: function() {
        var me = this;
        var typeNames = [];
        var featureTypes;

        Ext.each(me.getLayers(), function(l) {
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

        var url = me.getWfsServerUrl() + '?';
        Ext.iterate(describeFeatureTypeParams, function(k, v) {
            url += k + '=' + v + '&';
        });

        me.setLoading(true);

        Ext.Ajax.request({
            url: url,
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
     * Gets the features from the Featuretype, bound to our own event
     * `describeFeatureTypeResponse`.
     *
     * @param {Object} resp The XHR response from the DescribeFeatureType
     *     call.
     */
    getFeatures: function(resp) {
        var me = this;
        var featureTypes = resp.featureTypes;
        var cleanedFeatureType = me.cleanUpFeatureDataTypes(featureTypes);
        var url = me.getWfsServerUrl();
        var xml = me.setupXmlPostBody(cleanedFeatureType);
        var features;

        me.setLoading(true);

        Ext.Ajax.request({
            url: url,
            method: 'POST',
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
     * @param {Array<Object>} featureTypes The featuretypes.
     * @return {String} The XML.
     */
    setupXmlPostBody: function(featureTypes) {
        var me = this;
        var xml = '' +
            '<wfs:GetFeature' +
            ' service="WFS" version="1.1.0"' +
            ' outputFormat="application/json"' +
            ' xmlns:wfs="http://www.opengis.net/wfs"' +
            ' xmlns:ogc="http://www.opengis.net/ogc"' +
            ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
            ' xsi:schemaLocation="http://www.opengis.net/wfs' +
            ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">';

        Ext.each(featureTypes, function(ft) {
            Ext.each(ft.properties, function(prop) {
                xml += '' +
                    '<wfs:Query typeName="' + ft.typeName + '">' +
                        '<ogc:Filter>' +
                            '<ogc:PropertyIsLike' +
                            ' wildCard="*" singleChar="." escape="\\"' +
                            ' matchCase="false">' +
                                '<ogc:PropertyName>' +
                                    prop.name +
                                '</ogc:PropertyName>' +
                                '<ogc:Literal>' +
                                    '*' + me.searchTerm + '*' +
                                '</ogc:Literal>' +
                            '</ogc:PropertyIsLike>' +
                        '</ogc:Filter>' +
                    '</wfs:Query>';
            });
        });

        xml += '</wfs:GetFeature>';

        return xml;
    },

    /**
     * Show the search results in the grid.
     *
     * @param {Array<ol.Feature>} features The features.
     */
    showSearchResults: function(features) {
        var me = this;
        var grid = me.down('grid[name=searchresultgrid]');
        var parser = new ol.format.GeoJSON();

        if (features.length > 0) {
            grid.show();
        }

        var searchTerm = me.searchTerm;
        Ext.each(features, function(feature) {
            var featuretype = feature.id.split('.')[0];
            var displayfield;

            // find the matching value in order to display it
            Ext.iterate(feature.properties, function(k, v) {
                if (v && v.toString().toLowerCase().indexOf(searchTerm) > -1) {
                    displayfield = v;
                    return false;
                }
            });

            feature.properties.displayfield = displayfield;
            feature.properties.featuretype = featuretype;

            var olFeat = parser.readFeatures(feature, {
                dataProjection: 'EPSG:31467',
                featureProjection: 'EPSG:31467'
            })[0];
            me.searchResultVectorLayer.getSource().addFeature(olFeat);
        });

        var featureExtent = me.searchResultVectorLayer.getSource().getExtent();
        if (!Ext.Array.contains(featureExtent, Infinity)) {
            me.zoomToExtent(featureExtent);
        }
    },

    /**
     * Works with extent or geom.
     *
     * @param {ol.Extent|ol.geom.SimpleGeometry} extent The extent or geometry
     *     to zoom to.
     */
    zoomToExtent: function(extent) {
        var me = this;
        var olView = me.map.getView();
        var pan = ol.animation.pan({
            source: olView.getCenter()
        });
        var zoom = ol.animation.zoom({
            resolution: olView.getResolution()
        });
        me.map.beforeRender(pan, zoom);

        olView.fit(extent, me.map.getSize());
    },

    /**
     * Update the symbolizer in the grid.
     *
     * @param {HTMLElement} item The HTML-element where the renderer lives in.
     * @param {ol.style.Style} style The new style for the renderer.
     */
    updateRenderer: function(item, style) {
        var renderer = Ext.getCmp(
            Ext.query('div[id^=gx_renderer', true, item)[0].id);
        var src = renderer.map.getLayers().getArray()[0].getSource();
        src.getFeatures()[0].setStyle(style);
    },

    /**
     * Highlights the feature.
     *
     * Bound to the `itemmouseenter`-event on the grid.
     *
     * @param {Ext.view.View} tableView The tableView / grid.
     * @param {Ext.data.Model} record The record that belongs to the item.
     * @param {HTMLElement} item The item's element.
     */
    highlightFeature: function(tableView, record, item) {
        if (this.enterEventRec === record) {
            return;
        }
        var me = this;
        var feature;
        var radius;
        var text;

        this.enterEventRec = record;
        ol.Observable.unByKey(this.flashListenerKey);

        if (this.clusterResults) {
            feature = this.getClusterFeatureFromFeature(record.olObject);
            var featureStyle = this.clusterLayer.getStyle()(
                feature, me.map.getView().getResolution())[0];
            radius = featureStyle.getImage().getRadius();
            text = featureStyle.getText().getText();
        } else {
            feature = record.olObject;
            radius = 5; // default value
        }

        if (tableView.getSelection()[0] !== record) {
            feature.setStyle(
                this.getSearchResultHighlightFeatureStyleFn()(radius, text)
            );
            this.updateRenderer(item,
                this.getSearchResultHighlightFeatureStyleFn()(8, text)
            );
        }
        if (feature) {
            this.flashListenerKey = BasiGX.util.Animate.flashFeature(
                feature, 1000, radius);
        }
    },

    /**
     * Unhighlights a previously highlighted feature.
     *
     * Bound to the `itemmouseleave`-event on the grid.
     *
     * @param {Ext.view.View} tableView The tableView / grid.
     * @param {Ext.data.Model} record The record that belongs to the item.
     * @param {HTMLElement} item The item's element.
     */
    unhighlightFeature: function(tableView, record, item) {
        if (this.leaveEventRec === record) {
            return;
        }
        this.leaveEventRec = record;
        if (tableView.getSelection()[0] !== record) {
            record.olObject.setStyle(this.getSearchResultFeatureStyle());
            if (this.clusterResults) {
                this.updateRenderer(item, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(item, this.getSearchResultFeatureStyle());
            }
        }
    },

    /**
     * Highlights a selected feature.
     *
     * Bound to the `itemclick`-event on the grid.
     *
     * @param {Ext.view.View} tableView The tableView / grid.
     * @param {Ext.data.Model} record The record that belongs to the item.
     * @param {HTMLElement} item The item's element.
     */
    highlightSelectedFeature: function(tableView, record, item) {
        record.olObject.setStyle(this.getSearchResultSelectFeatureStyle());
        this.updateRenderer(item, this.getSearchResultSelectFeatureStyle());

        this.zoomToExtent(record.olObject.getGeometry());
    },

    /**
     * Returns the cluster feature from the given `ol.Feature`.
     *
     * @param {ol.Feature} feature The feature to get the cluster feature from.
     * @return {ol.Feature} The cluster feature.
     */
    getClusterFeatureFromFeature: function(feature) {
        var me = this;
        var clusterFeature;
        var clusterFeatures = me.clusterLayer.getSource().getFeatures();
        Ext.each(clusterFeatures, function(feat) {
            if (!Ext.isEmpty(feat.get('features'))) {
                Ext.each(feat.get('features'), function(f) {
                    if (f.getId() === feature.getId()) {
                        clusterFeature = feat;
                        return false;
                    }
                });
            }
            if (!Ext.isEmpty(clusterFeature)) {
                return false;
            }
        });
        return clusterFeature;
    }
});
