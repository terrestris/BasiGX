/* Copyright (c) 2016 mundialis GmbH & Co. KG
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
 * WMS-Time Slider
 *
 * Used to slide through all timestamps from a WMS-Time Layer. Timestamps are
 * taken from the layer's getCapabilitites document when displayed as a list.
 *
 * Example usage:
 *
 * {
 *      xtype: 'basigx-container-wmstimeslider',
 *      url: 'http://example.de/geoserver/timeseries/wms',
 *      layerNameInWMS: 'timeseries',
 *      layerNameInClient: 'timeseries1'
 * }
 *
 * TODOs:
 *   * Make type of timestamp on labels and tooltips configurable
 *     (now it shows interval in days)
 *
 * @class BasiGX.view.container.WMSTimeSlider
 */
Ext.define("BasiGX.view.container.WMSTimeSlider",{
    extend: "Ext.container.Container",
    xtype: 'basigx-container-wmstimeslider',

    width: '95%',

    config: {
        times: []
    },

    url: null,

    layerNameInWMS: null,

    layerNameInClient: null,

    cls: 'timeSlider',

    initComponent: function() {
        var me = this;
        var slidercontainer = this;
        var params = Ext.apply({
            service: 'WMS',
            version: '1.3.0',
            request: 'GetCapabilities'
        });
        Ext.Ajax.request({
            url: slidercontainer.url,
            method: 'GET',
            params: params,
            async: false,
            success: function(response) {
                var parser = new ol.format.WMSCapabilities();
                var result;
                var timelayer;
                var timevalues;
                try {
                    result = parser.read(response.responseText);
                } catch(ex) {
                    Ext.Msg.alert("Error", "Could not parse GetCapabilites from layer");
                    return;
                }
                Ext.each(result.Capability.Layer.Layer, function(layer) {
                    if (layer.Name === slidercontainer.layerNameInWMS) {
                        timelayer = layer;
                    }
                });
                Ext.each(timelayer.Dimension, function(dimension) {
                    if (dimension.name === "time") {
                        timevalues = dimension.values;
                    }
                });

                var WMStimes = timevalues.split(",");
                slidercontainer.setTimes(WMStimes);

            },
            failure: function() {
                Ext.Msg.alert("Error", "Could not reach WMS");
            }

        });

        me.callParent(arguments);
    },

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [
            {
                xtype: 'container',
                name: 'labelcontainer',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                defaults: {
                    xtype: 'container',
                    flex: 1
                },
                items: [],
                listeners: {
                    boxready: {
                        fn: function() {
                            var me = this;
                            me.up().setLabels();
                        }
                    }
                }
            },
            {
                xtype: 'slider',
                name: 'timeslider',
                tipText: function(thumb){
                    var slider = Ext.ComponentQuery.query('basigx-container-wmstimeslider')[0];
                    var time = slider.getTimes()[thumb.value];
                    return Ext.Date.format(new Date(time), 'Y-m-d');
                },
                listeners:{
                    boxready: {
                        fn: function(){
                            var me = this;
                            me.maxValue = me.up().getTimes().length-1;
                        }
                    },
                    change: {
                        fn: function(){
                            var me = this;
                            me.up().updateTime();
                        }
                    }
                }

            }
    ],

    setLabels: function() {
        var me = this;

        var labelcontainer;
        Ext.each(me.items.items, function(item) {
            if (item.name === "labelcontainer") {
                labelcontainer = item;
            }
        });

        //Do not add all labels but first, middle and last
        var start = Ext.Date.format(new Date(me.getTimes()[0]), 'Y-m-d');
        var middle = Ext.Date.format(new Date(me.getTimes()[Math.floor(me.getTimes().length/2)]), 'Y-m-d');
        var end = Ext.Date.format(new Date(me.getTimes()[me.getTimes().length-1]), 'Y-m-d');

        labelcontainer.add({
            html: start
        });
        labelcontainer.add({
            html: '<div style="text-align:center;">' + middle + '</div>'
        });
        labelcontainer.add({
            html: '<div style="float:right;">' + end + '</div>'
        });

    },

    updateTime: function() {
        var me = this;
        var timeslider;
        Ext.each(me.items.items, function(item){
            if (item.name === "timeslider") {
                timeslider = item;
            }
        });
        var time = me.getTimes()[timeslider.getValue()];
        var layer = BasiGX.util.Layer.getLayerByName(me.layerNameInClient);
        layer.getSource().updateParams({TIME:time});
    }

});
