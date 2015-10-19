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
 * WFS Search
 *
 * Used to search in multiple featuretypes
 *
 * Example usage:
 *
 * {
 *      xtype: 'basigx-search-wfs'
 * }
 *
 */
Ext.define("BasiGX.view.container.WfsSearch", {
    extend: "Ext.container.Container",
    xtype: "basigx-search-wfs",

    requires: [
        'GeoExt.data.store.Features',
        'GeoExt.grid.column.Symbolizer',

        'BasiGX.util.Animate'
    ],

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
         *
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
         *
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
         *
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
        *
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
         *
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
    initComponent: function() {
        var me = this,
            map = Ext.ComponentQuery.query('gx_map')[0].getMap();

        if (Ext.isEmpty(me.getLayers())) {
            Ext.log.error('No layers given to search component!');
        }

        if (!me.searchResultVectorLayer) {
            me.searchResultVectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: me.getSearchResultFeatureStyle(),
                visible: !me.clusterResults
            });
            map.addLayer(me.searchResultVectorLayer);
        }

        if (me.clusterResults && !me.clusterLayer) {
            var clusterSource = new ol.source.Cluster({
                distance: 40,
                source: me.searchResultVectorLayer.getSource()//new ol.source.Vector()
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
            map.addLayer(me.clusterLayer);

            // correct the vectorlayerstyle for the grid symbolizer
            me.searchResultVectorLayer.setStyle(me.clusterStyleFn('', 8));

        }

        var searchResultStore = Ext.create('GeoExt.data.store.Features', {
            map: map,
            layer: me.searchResultVectorLayer,
            groupField: 'featuretype'
        });

        me.items = [
            {
                xtype: 'textfield',
                name: 'searchTerm',
                fieldLabel: 'Suchbegriff',
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
                title: 'Suchergebnisse',
                store: searchResultStore,
                columns: [
                    {
                        xtype: 'gx_symbolizercolumn',
                        flex: 1
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
                text: 'Zurücksetzen',
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
     *
     */
    handleKeyDown: function(textfield) {
        var me = textfield.up('basigx-search-wfs'),
            val = textfield.getValue();

        if (val.length < me.getMinSearchTextChars()) {
            return;
        }

        // set the searchterm on component
        me.searchTerm = val;

        // reset grid from aold values
        me.resetGrid();

        // prepare the describeFeatureType for all given layers
        if (me.typeDelayTask) {
            me.typeDelayTask.cancel();
        }
        me.typeDelayTask = new Ext.util.DelayedTask(function(){
            me.describeFeatureTypes();
        });
        me.typeDelayTask.delay(me.getTypeDelay());

    },

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
        me.searchResultVectorLayer.getSource().clear();
        me.down('grid[name=searchresultgrid]').hide();
    },

    /**
     *
     */
    describeFeatureTypes: function() {
        var me = this,
            typeNames = [],
            featureTypes;

        Ext.each(me.getLayers(), function(l) {
            if (l.getSource().getParams) {
                typeNames.push(l.getSource().getParams().LAYERS);
            }
        });

        var describeFeatureTypeParams = {
            REQUEST: "DescribeFeatureType",
            SERVICE: "WFS",
            VERSION: "1.1.0",
            OUTPUTFORMAT: "application/json",
            TYPENAME: typeNames.toString()
        };

        var url = me.getWfsServerUrl() + "?";
        Ext.iterate(describeFeatureTypeParams, function(k, v) {
            url += k + "=" + v + "&";
        });

        me.setLoading(true);

        Ext.Ajax.request({
            url: url,
            success: function(response){
                me.setLoading(false);
                if(Ext.isString(response.responseText)) {
                    featureTypes = Ext.decode(response.responseText);
                } else if(Ext.isObject(response.responseText)) {
                    featureTypes = response.responseText;
                } else {
                    Ext.log.error("Error! Could not parse " +
                        "describe featuretype response!");
                }
                me.fireEvent('describeFeatureTypeResponse', featureTypes);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error("Error on describe featuretype request:",
                    response);
            }
        });
    },

    /**
     *
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
            success: function(response){
                me.setLoading(false);
                if(Ext.isString(response.responseText)) {
                    features = Ext.decode(response.responseText).features;
                } else if(Ext.isObject(response.responseText)) {
                    features = response.responseText.features;
                } else {
                    Ext.log.error("Error! Could not parse " +
                        "GetFeature response!");
                }
                me.fireEvent('getFeatureResponse', features);
            },
            failure: function(response) {
                me.setLoading(false);
                Ext.log.error("Error on GetFeature request:",
                    response);
            }
        });
    },

    /**
     * Method removes unwanted dataTypes
     */
    cleanUpFeatureDataTypes: function(featureTypes) {
        var me = this,
            cleanedFeatureType = [];
        Ext.each(featureTypes, function(ft, index) {
            cleanedFeatureType.push({
                typeName: ft.typeName,
                properties: []
            });

            Ext.each(ft.properties, function(prop) {
                if (Ext.Array.contains(
                    me.getAllowedFeatureTypeDataTypes(), prop.type) &&
                    prop.name.indexOf(" ") < 0) {
                        cleanedFeatureType[index].properties.push(prop);
                }
            });
        });
        return cleanedFeatureType;
    },

    /**
     *
     */
    setupXmlPostBody: function(featureTypes) {
        var me = this;
        var xml =
            '<wfs:GetFeature service="WFS" version="1.1.0" ' +
              'outputFormat="application/json" ' +
              'xmlns:wfs="http://www.opengis.net/wfs" ' +
              'xmlns:ogc="http://www.opengis.net/ogc" ' +
              'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
              'xsi:schemaLocation="http://www.opengis.net/wfs ' +
              'http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">';

        Ext.each(featureTypes, function(ft) {
            Ext.each(ft.properties, function(prop) {
                xml +=
                    '<wfs:Query typeName="' + ft.typeName + '">' +
                        '<ogc:Filter>' +
                            '<ogc:PropertyIsLike wildCard="*" singleChar="." escape="\\" matchCase="false">' +
                                '<ogc:PropertyName>' + prop.name + '</ogc:PropertyName>' +
                                '<ogc:Literal>*' + me.searchTerm + '*</ogc:Literal>' +
                            '</ogc:PropertyIsLike>' +
                        '</ogc:Filter>' +
                    '</wfs:Query>';
            });
        });

        xml += '</wfs:GetFeature>';

        return xml;
    },

    /**
     *
     */
    showSearchResults: function(features) {

        var me = this,
            grid = me.down('grid[name=searchresultgrid]'),
            parser = new ol.format.GeoJSON();

        if(features.length > 0){
            grid.show();
        }

        Ext.each(features, function(feature) {
            var featuretype = feature.id.split(".")[0];
            var displayfield;

            // find the matching value in order to display it
            Ext.iterate(feature.properties, function(k, v) {
                if (v && v.toString().toLowerCase().indexOf(me.searchTerm) > -1) {
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
        if(!Ext.Array.contains(featureExtent, Infinity)){
            me.zoomToExtent(featureExtent);
        }
    },

    /**
     * Works with extent or geom.
     */
    zoomToExtent: function(extent){
        var olMap = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var olView = olMap.getView();
        var pan = ol.animation.pan({
            source: olView.getCenter()
        });
        var zoom = ol.animation.zoom({
           resolution: olView.getResolution()
        });
        olMap.beforeRender(pan, zoom);

        olView.fit(extent, olMap.getSize());
    },

    /**
     * update the symbolizer in the grid
     */
    updateRenderer: function(item, style){
        var renderer = Ext.getCmp(
            Ext.query('div[id^=gx_renderer', true, item)[0].id);
        var src = renderer.map.getLayers().getArray()[0].getSource();
        src.getFeatures()[0].setStyle(style);
    },

    /**
     *
     */
    highlightFeature: function(tableView, record, item) {
        if(this.enterEventRec === record){
            return;
        }
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var feature;
        var radius;
        var text;

        this.enterEventRec = record;
        ol.Observable.unByKey(this.flashListenerKey);

        if (this.clusterResults) {
            feature = this.getClusterFeatureFromFeature(record.olObject);
            var featureStyle = this.clusterLayer.getStyle()(
                feature, map.getView().getResolution())[0];
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
     *
     */
    unhighlightFeature: function(tableView, record, item) {
        if(this.leaveEventRec === record){
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
     *
     */
    highlightSelectedFeature: function(tableView, record, item) {
        var store = tableView.getStore();
        store.each(function(rec){
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
     *
     */
    getClusterFeatureFromFeature: function(feature){
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
