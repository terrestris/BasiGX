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
 * Nominatim Search
 *
 * Used to search in the glorious dataset of OSM
 *
 * Example of usage:
 *
 *     {
 *         xtype: 'basigx-search-nominatim',
 *         clusterResults: true,
 *         viewboxlbrt: '6.9186,52.4677,11.2308,53.9642'
 *     }
 *
 * TODO This class has a lot in common with both #OverpassSearch and the
 *      generic #WfsSearch. We should factor out shared code.
 *
 * @class BasiGX.view.container.NominatimSearch
 */
Ext.define('BasiGX.view.container.NominatimSearch', {
    extend: 'Ext.container.Container',
    xtype: 'basigx-search-nominatim',

    requires: [
        'GeoExt.data.store.Features',
        'GeoExt.component.FeatureRenderer',

        'BasiGX.util.Animate',
        'BasiGX.util.Map'
    ],

    viewModel: {
        data: {
            searchTermTextFieldLabel: 'Suchbegriff',
            searchResultGridTitle: 'Suchergebnisse',
            resetBtnText: 'Zurücksetzen',
            documentation: '<h2>Nominatim-Suche</h2>• Benutzen Sie die ' +
                'Nominatim Suche, um nach Orten, Straßen, Koordinaten oder ' +
                'anderen geographisch verortenen Daten aus dem Bestand von ' +
                'OpenStreetMap zu suchen'
        }
    },

    config: {
        /**
         * The URL to the nominatim service
         */
        nominatimUrl: 'http://nominatim.openstreetmap.org',

        /**
         *
         */
        format: 'json',

        /**
         * limit the search results count
         */
        limit: 100,

        /**
         * The lat-lon viewbox to limit the searchquery to
         */
        viewboxlbrt: '-180,90,180,-90',

        /**
         * minimum chars to trigger the search
         */
        minSearchTextChars: 3,

        /**
         * delay before query gets triggered to avoid triggers while typing
         */
        typeDelay: 500,

        /**
         * the template to change the groups titles
         */
        groupHeaderTpl: '{type}',

        /**
         * An `ol.style.Style` for result features.
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
         * An `ol.style.Style` for selected result features.
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

        if (!me.searchResultVectorLayer) {
            me.searchResultVectorLayer = new ol.layer.Vector({
                name: 'nominatimsearchresult',
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
                name: 'nominatimclusterlayer',
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
            groupField: 'type'
        });

        me.items = [
            {
                xtype: 'textfield',
                name: 'nominatimSearchTerm',
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
                name: 'nominatimsearchresultgrid',
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

        me.on('nominatimResponse', me.showSearchResults);
        me.on('show', me.down('textfield').focus);

        var grid = me.down('grid[name=nominatimsearchresultgrid]');

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
        var nominatimContainer = textfield.up('basigx-search-nominatim');
        var val = textfield.getValue();

        if (val.length < nominatimContainer.getMinSearchTextChars()) {
            return;
        }

        // set the searchterm on component
        nominatimContainer.searchTerm = val;

        // reset grid from old values
        nominatimContainer.resetGrid();

        // prepare the describeFeatureType for all given layers
        if (nominatimContainer.typeDelayTask) {
            nominatimContainer.typeDelayTask.cancel();
        }
        nominatimContainer.typeDelayTask = new Ext.util.DelayedTask(function() {
            nominatimContainer.triggerSearch();
        });
        nominatimContainer.typeDelayTask.delay(
            nominatimContainer.getTypeDelay()
        );
    },

    /**
     *
     */
    resetSearchGridAndText: function() {
        var me = this;
        me.down('textfield[name=nominatimSearchTerm]').setValue('');
        me.resetGrid();
    },

    /**
     *
     */
    resetGrid: function() {
        var me = this;
        me.searchResultVectorLayer.getSource().clear();
        me.down('grid[name=nominatimsearchresultgrid]').hide();
    },

    /**
     * Actually trigger the search.
     */
    triggerSearch: function() {
        var me = this;
        var results;

        var requestParams = {
            q: me.searchTerm,
            format: me.getFormat(),
            limit: me.getLimit(),
            viewboxlbrt: me.getViewboxlbrt(),
            bounded: 1
        };

        var url = me.getNominatimUrl() + '?';
        Ext.iterate(requestParams, function(k, v) {
            url += k + '=' + v + '&';
        });

        me.setLoading(true);

        Ext.Ajax.request({
            url: url,
            success: function(response) {
                me.setLoading(false);
                if (Ext.isString(response.responseText)) {
                    results = Ext.decode(response.responseText);
                } else if (Ext.isObject(response.responseText)) {
                    results = response.responseText;
                } else {
                    Ext.log.error('Error! Could not parse ' +
                        'nominatim response!');
                }
                me.fireEvent('nominatimResponse', results);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error('Error on nominatim request:',
                    response);
            }
        });
    },

    /**
     * Response example:
     *
     *     {
     *       "place_id":"14823013",
     *       "licence":"Data © OpenStreetMap contributors, ODbL 1.0. http:/[…]",
     *       "osm_type":"node",
     *       "osm_id":"1364459810",
     *       "boundingbox":[
     *         "53.4265254",
     *         "53.4266254",
     *         "8.5341417",
     *         "8.5342417"
     *       ],
     *       "lat":"53.4265754",
     *       "lon":"8.5341917",
     *       "display_name":"Bäckerei, Bütteler Straße, Loxstedt, Landkreis[…]",
     *       "class":"highway",
     *       "type":"bus_stop",
     *       "importance":0.101,
     *       "icon":"http://nominatim.openstreetmap.org/images/mapicons/tra[…]",
     *       "address":{
     *         "bus_stop":"Bäckerei",
     *         "road":"Bütteler Straße",
     *         "village":"Loxstedt",
     *         "county":"Landkreis Cuxhaven",
     *         "state":"Niedersachsen",
     *         "postcode":"27612",
     *         "country":"Deutschland",
     *         "country_code":"de"
     *       }
     *     }
     *
     * @param {Array<ol.Feature>} features The features to display in the result
     *     grid.
     */
    showSearchResults: function(features) {
        var me = this;
        var grid = me.down('grid[name=nominatimsearchresultgrid]');

        if (features.length > 0) {
            grid.show();
        }

        var searchTerm = me.searchTerm;
        Ext.each(features, function(feature) {
            var displayfield;

            // find the matching value in order to display it
            Ext.iterate(feature, function(k, v) {
                if (v && v.toString().toLowerCase().indexOf(searchTerm) > -1) {
                    displayfield = v;
                    return false;
                }
            });

            var olFeat = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform(
                    [parseFloat(feature.lon), parseFloat(feature.lat)],
                    'EPSG:4326', 'EPSG:3857'
                )),
                properties: feature
            });
            if (!displayfield) {
                olFeat.set('displayfield', feature.display_name);
            } else {
                olFeat.set('displayfield', displayfield);
            }
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

        // This if is need for backwards comaptibility to ol3
        if (ol.animation) {
            var pan = ol.animation.pan({
                source: olView.getCenter()
            });
            var zoom = ol.animation.zoom({
                resolution: olView.getResolution()
            });
            me.map.beforeRender(pan, zoom);
            olView.fit(extent, me.map.getSize());
        } else {
            olView.fit(extent, {
                duration: 500
            });
        }
    },

    /**
     * Update the symbolizer in the grid.
     *
     * @param {HTMLElement} item The HTML-element where the renderer lives in.
     * @param {ol.style.Style} style The new style for the renderer.
     */
    updateRenderer: function(item, style) {
        var renderer = Ext.getCmp(
            Ext.query('div[id^=gx_renderer', true, item)[0].id
        );
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
        var store = tableView.getStore();
        store.each(function(rec) {
            rec.olObject.setStyle(this.getSearchResultFeatureStyle());
            var row = tableView.getRowByRecord(rec);
            if (this.clusterResults) {
                this.updateRenderer(row, this.clusterStyleFn('', 8));
            } else {
                this.updateRenderer(row, this.getSearchResultFeatureStyle());
            }
        }, this);

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
                    if (f.getProperties().properties.osm_id &&
                       feature.getProperties().properties.osm_id &&
                       f.getProperties().properties.osm_id ===
                       feature.getProperties().properties.osm_id) {
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
