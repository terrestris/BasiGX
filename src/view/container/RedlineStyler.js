/* Copyright (c) 2016 terrestris GmbH & Co. KG
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
 * Redline Styler
 *
 * Used in combination with the Redline Tools Container and allows a user
 * to modify the styles the features are drawn with.
 * You need to require the 'ux' package in your app.json to make use of this
 * component.
 *
 * @class BasiGX.view.container.RedlineStyler
 */
Ext.define("BasiGX.view.container.RedlineStyler", {
    extend: "Ext.container.Container",
    xtype: "basigx-container-redlinestyler",

    requires: [
        'Ext.ux.colorpick.Button',
        'BasiGX.view.panel.GraphicPool'
    ],

    /**
     *
     */
    redliningVectorLayer: null,

    /**
     *
     */
    padding: 5,

    /**
     * The url objects for images.
     * Can contain url and method property
     */
    config: {
        backendUrls: {
            pictureList: null,
            pictureSrc: null,
            pictureUpload: null,
            graphicDelete: null
        }
    },

    /**
     *
     */
    initComponent: function(config) {
        this.items = [];
        this.items.push(this.getPointFieldset());
        this.items.push(this.getLineStringFieldset());
        this.items.push(this.getPolygonFieldset());
        this.callParent([config]);
    },

    /**
     *
     */
    getPointFieldset: function(){
        var redliningContainer = Ext.ComponentQuery.query(
                'basigx-container-redlining')[0],
            style = redliningContainer.getRedlinePointStyle(),
            me = this,
            fs = {
                xtype: 'fieldset',
                title: 'Point Style',
                layout: 'hbox',
                items: [
                  {
                     xtype: 'tabpanel',
                     items: [
                         {
                             xtype: 'panel',
                             title: 'Symbol',
                             defaults: {
                                 margin: 3,
                                 width: 220
                             },
                             items: [
                                 {
                                     xtype : 'numberfield',
                                     fieldLabel : 'Point Radius',
                                     value : style.getImage().getRadius(),
                                     minValue: 1,
                                     maxValue: 50,
                                     listeners: {
                                         change: function(field, val) {
                                             me.updateStyle({radius: val});
                                         }
                                     }
                                 },
                                 {
                                     xtype : 'numberfield',
                                     fieldLabel : 'Stroke Width',
                                     value : style.getImage().getStroke()
                                         .getWidth(),
                                     minValue: 0,
                                     maxValue: 50,
                                     listeners: {
                                         change: function(field, val) {
                                             me.updateStyle({strokewidth: val});
                                         }
                                     }
                                 },
                                 {
                                     xtype: 'container',
                                     layout: 'hbox',
                                     defaults: {
                                         width: 100
                                     },
                                     items: [
                                        {
                                             xtype: 'displayfield',
                                             width: 100,
                                             value: 'Stroke Color'
                                         },{
                                            xtype : 'colorbutton',
                                            format: 'hex8',
                                            value : style.getImage()
                                                .getStroke().getColor(),
                                            margin: '5 0 0 10',
                                            listeners: {
                                                change: function(field, val) {
                                                    var color =
                                                        BasiGX.util.Color
                                                        .hex8ToRgba(val);
                                                    me.updateStyle(
                                                        {strokecolor: color}
                                                    );
                                                }
                                            }
                                        }
                                     ]
                                 },
                                 {
                                     xtype: 'container',
                                     layout: 'hbox',
                                     defaults: {
                                         width: 100
                                     },
                                     items: [
                                        {
                                             xtype: 'displayfield',
                                             width: 100,
                                             value: 'Fill Color'
                                         },{
                                            xtype : 'colorbutton',
                                            format: 'hex8',
                                            margin: '0 0 0 10',
                                            value : style.getImage().getFill()
                                                .getColor(),
                                            listeners: {
                                                change: function(field, val) {
                                                    var color =
                                                        BasiGX.util.Color
                                                        .hex8ToRgba(val);
                                                    me.updateStyle(
                                                        {fillcolor: color}
                                                    );
                                                }
                                            }
                                        }
                                     ]
                                 }
                             ]
                         },
                         {
                             xtype: 'panel',
                             title: "Graphic",
                             defaults: {
                                 margin: 3,
                                 width: 220
                             },
                             items: [
                                 {
                                     xtype : 'button',
                                     text: "Choose Image",
                                     handler: me.onChooseGraphicClick,
                                     scope: me
                                 },
                                 {
                                     xtype : 'slider',
                                     fieldLabel : "Graphic Offset X",
                                     name: 'xoffset',
                                     value: 50,
                                     minValue: 0,
                                     maxValue: 100,
                                     listeners: {
                                         change: function() {
                                             var values =
                                                 me.getImageAttributes();
                                             me.changeIconStyle(values);
                                         },
                                         scope: me
                                     }
                                },
                                {
                                     xtype : 'slider',
                                     fieldLabel : "Graphic Offset Y",
                                     name: 'yoffset',
                                     value: 50,
                                     minValue: 0,
                                     maxValue: 100,
                                     listeners: {
                                         change: function() {
                                             var values =
                                                 me.getImageAttributes();
                                             me.changeIconStyle(values);
                                         },
                                         scope: me
                                     }
                                },
                                {
                                    xtype : 'slider',
                                    fieldLabel : "Scale",
                                    name: 'iconscale',
                                    value: 100,
                                    increment: 1,
                                    minValue: 10,
                                    maxValue: 500,
                                    listeners: {
                                        change: function() {
                                            var values =
                                                me.getImageAttributes();
                                            me.changeIconStyle(values);
                                        },
                                        scope: me
                                    }
                               }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    border: false,
                    layout: 'fit',
                    items: [{
                        xtype: 'gx_renderer',
                        margin: 20,
                        width: 200,
                        height: 160,
                        name: 'pointRenderPreview',
                        symbolizers: style,
                        symbolType: 'Point'
                    }]
                }]
            };
        return fs;
    },

    /**
     *
     */
    getLineStringFieldset: function() {
        var me = this,
            redliningContainer = Ext.ComponentQuery.query(
                'basigx-container-redlining')[0],
            style = redliningContainer.getRedlineLineStringStyle(),
            fs = {
                xtype: 'fieldset',
                title: 'LineString Style',
                layout: 'hbox',
                items: [{
                    xtype: 'fieldset',
                    layout: 'vbox',
                    width: 220,
                    defaults: {
                        margin: 3,
                        width: 180
                    },
                    items: [
                        {
                             xtype : 'numberfield',
                             fieldLabel : 'Stroke Width',
                             value : style.getStroke().getWidth(),
                             minValue: 0,
                             maxValue: 50,
                             listeners: {
                                 change: function(field, val) {
                                     me.updateStyle(null, {strokewidth: val});
                                 }
                             }
                         },
                         {
                             xtype: 'container',
                             layout: 'hbox',
                             defaults: {
                                 width: 70
                             },
                             items: [
                                {
                                     xtype: 'displayfield',
                                     width: 100,
                                     value: 'Stroke Color'
                                 },{
                                    xtype : 'colorbutton',
                                    format: 'hex8',
                                    value : style.getStroke().getColor(),
                                    margin: '5 0 0 10',
                                    listeners: {
                                        change: function(field, val) {
                                            var color = BasiGX.util.Color
                                                .hex8ToRgba(val);
                                            me.updateStyle(null,
                                                {strokecolor: color}
                                            );
                                        }
                                    }
                                }
                             ]
                         }
                     ]
                },{
                    xtype: 'panel',
                    border: false,
                    layout: 'fit',
                    items: [{
                        xtype: 'gx_renderer',
                        margin: 20,
                        width: 200,
                        height: 60,
                        name: 'lineRenderPreview',
                        symbolizers: style,
                        symbolType: 'Line'
                    }]
                }]
            };
        return fs;
    },

    /**
     *
     */
    getPolygonFieldset: function() {
        var me = this,
            redliningContainer = Ext.ComponentQuery.query(
                'basigx-container-redlining')[0],
            style = redliningContainer.getRedlinePolygonStyle(),
            fs = {
                xtype: 'fieldset',
                title: 'Polygon Style',
                layout: 'hbox',
                items: [{
                    xtype: 'fieldset',
                    layout: 'vbox',
                    width: 220,
                    defaults: {
                        width: 180
                    },
                    items: [
                        {
                             xtype : 'numberfield',
                             fieldLabel : 'Stroke Width',
                             value : style.getStroke().getWidth(),
                             minValue: 0,
                             maxValue: 50,
                             listeners: {
                                 change: function(field, val) {
                                     me.updateStyle(null, null,
                                         {strokewidth: val}
                                     );
                                 }
                             }
                         },
                         {
                             xtype: 'container',
                             layout: 'hbox',
                             defaults: {
                                 width: 70
                             },
                             items: [
                                {
                                     xtype: 'displayfield',
                                     width: 100,
                                     value: 'Stroke Color'
                                 },{
                                    xtype : 'colorbutton',
                                    format: 'hex8',
                                    value : style.getStroke().getColor(),
                                    margin: '5 0 0 10',
                                    listeners: {
                                        change: function(field, val) {
                                            var color = BasiGX.util.Color
                                                .hex8ToRgba(val);
                                            me.updateStyle(null, null,
                                                {strokecolor: color}
                                            );
                                        }
                                    }
                                }
                             ]
                         },
                         {
                             xtype: 'container',
                             layout: 'hbox',
                             defaults: {
                                 width: 100
                             },
                             items: [
                                {
                                     xtype: 'displayfield',
                                     width: 100,
                                     value: 'Fill Color'
                                 },{
                                    xtype : 'colorbutton',
                                    format: 'hex8',
                                    margin: '0 0 0 10',
                                    value : style.getFill().getColor(),
                                    listeners: {
                                        change: function(field, val) {
                                            var color = BasiGX.util.Color
                                                .hex8ToRgba(val);
                                            me.updateStyle(null, null,
                                                {fillcolor: color}
                                            );
                                        }
                                    }
                                }
                             ]
                         }
                     ]
                },{
                    xtype: 'panel',
                    border: false,
                    layout: 'fit',
                    items: [{
                        xtype: 'gx_renderer',
                        margin: 20,
                        width: 200,
                        height: 100,
                        name: 'polygonRenderPreview',
                        symbolizers: style,
                        symbolType: 'Polygon'
                    }]
                }]
            };
        return fs;
    },

    /**
     * Update the style by rewriting and reapplying on the layer and
     * gx_renderer
     */
    updateStyle: function(pointStyle, lineStyle, polygonStyle) {
        var me = this;
        var oldStyle;
        var style;
        var renderer;
        var redliningContainer = Ext.ComponentQuery.query(
            'basigx-container-redlining')[0];

        if (pointStyle) {
            oldStyle = redliningContainer.getRedlinePointStyle();
            renderer = me.down('gx_renderer[name=pointRenderPreview]');
            style = me.generatePointStyle(oldStyle, pointStyle);
            redliningContainer.setRedlinePointStyle(style);
        } else if (lineStyle) {
            oldStyle = redliningContainer.getRedlineLineStringStyle();
            renderer = me.down('gx_renderer[name=lineRenderPreview]');
            style = me.generateLineStringStyle(oldStyle, lineStyle);
            redliningContainer.setRedlineLineStringStyle(style);
        } else {
            oldStyle = redliningContainer.getRedlinePolygonStyle();
            renderer = me.down('gx_renderer[name=polygonRenderPreview]');
            style = me.generatePolygonStyle(oldStyle, polygonStyle);
            redliningContainer.setRedlinePolygonStyle(style);
        }

        // refresh the gx_renderer
        if (renderer) {
            renderer.setSymbolizers(style);
        }
        // reapply the styleFn on the layer so that ol3 starts redrawing
        // with new styles
        me.redliningVectorLayer.setStyle(me.redliningVectorLayer.getStyle());
    },

    /**
     *
     */
    generatePointStyle: function(oldStyle, pointStyle) {
        var style = new ol.style.Style({
            image: pointStyle.radius || pointStyle.fillcolor ||
            pointStyle.fillopacity || pointStyle.strokewidth ||
            pointStyle.strokecolor ?
            new ol.style.Circle({
                radius: pointStyle.radius || oldStyle.getImage().getRadius(),
                fill: pointStyle.fillcolor || pointStyle.fillopacity ?
                new ol.style.Fill({
                    color: pointStyle.fillcolor ? pointStyle.fillcolor :
                        oldStyle.getImage().getFill().getColor(),
                    opacity: pointStyle.fillopacity ? pointStyle.fillopacity :
                        oldStyle.getImage().getFill().getColor()
                }) : oldStyle.getImage().getFill(),
                stroke: pointStyle.strokewidth || pointStyle.strokecolor ?
                new ol.style.Stroke({
                    color: pointStyle.strokecolor ? pointStyle.strokecolor :
                        oldStyle.getImage().getStroke().getColor(),
                    width: pointStyle.strokewidth ? pointStyle.strokewidth :
                        oldStyle.getImage().getStroke().getWidth()
                }) : oldStyle.getImage().getStroke()
            }) : oldStyle.getImage()
       });
        return style;
    },

    /**
     *
     */
    generateLineStringStyle: function(oldStyle, lineStyle) {
        var style = new ol.style.Style({
            stroke: lineStyle.strokewidth || lineStyle.strokecolor ?
            new ol.style.Stroke({
                color: lineStyle.strokecolor ? lineStyle.strokecolor :
                    oldStyle.getStroke().getColor(),
                width: lineStyle.strokewidth ? lineStyle.strokewidth :
                    oldStyle.getStroke().getWidth()
            }) : oldStyle.getStroke()
        });
        return style;
    },

    /**
     *
     */
    generatePolygonStyle: function(oldStyle, polygonStyle) {
        var style = new ol.style.Style({
            fill: polygonStyle.fillcolor ?
            new ol.style.Fill({
                color: polygonStyle.fillcolor
            }) : oldStyle.getFill(),
            stroke: polygonStyle.strokewidth || polygonStyle.strokecolor ?
            new ol.style.Stroke({
                color: polygonStyle.strokecolor ? polygonStyle.strokecolor :
                    oldStyle.getStroke().getColor(),
                width: polygonStyle.strokewidth ? polygonStyle.strokewidth :
                    oldStyle.getStroke().getWidth()
            }) : oldStyle.getStroke()
        });
        return style;
    },

    /**
     *
     */
    onChooseGraphicClick: function() {
        var me = this;
        var redliningContainer = Ext.ComponentQuery.query(
            'basigx-container-redlining')[0];

        var okClickCallbackFn = function(pictureRec) {
            var renderer = me.down('gx_renderer[name=pointRenderPreview]');
            var pictureUrl = BasiGX.util.Url.getWebProjectBaseUrl() +
                me.getBackendUrls().pictureSrc.url +
                pictureRec.get('id');
            var imageValues = me.getImageAttributes();
            var imageStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [
                        imageValues[0],
                        imageValues[1]
                    ],
                    scale: imageValues[2],
                    src: pictureUrl
                })
            });
            redliningContainer.setRedlinePointStyle(imageStyle);
            // reapply the styleFn on the layer so that ol3 starts redrawing
            // with new styles
            me.redliningVectorLayer.setStyle(me.redliningVectorLayer.getStyle());
            renderer.setSymbolizers(imageStyle);
        };

        var deleteClickCallbackFn = function() {
            Ext.toast(
                'The icon has been deleted. Please reassign a new one.',
                'Deletion succesfull',
                't'
            );
        };

        var graphicPool = Ext.create('BasiGX.view.panel.GraphicPool', {
            backendUrls: me.getBackendUrls(),
            okClickCallbackFn: okClickCallbackFn,
            deleteClickCallbackFn: deleteClickCallbackFn,
            useCsrfToken: true
        });

        var graphicPoolWin = Ext.create('Ext.window.Window', {
            title: 'Graphic Pool',
            constrained: true,
            items: [graphicPool]
        });
        graphicPoolWin.show();
    },

    /**
     *
     */
    changeIconStyle: function(imageProps) {
        var me = this;
        var offsetX = imageProps[0];
        var offsetY = imageProps[1];
        var scale = imageProps[2];

        var redliningContainer = Ext.ComponentQuery.query(
            'basigx-container-redlining')[0];
        var renderer = me.down('gx_renderer[name=pointRenderPreview]');
        var oldStyle = redliningContainer.getRedlinePointStyle().getImage();
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                scale: scale,
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                anchor: [
                    offsetX,
                    offsetY
                ],
                src: oldStyle.getSrc()
            })
        });
        renderer.setSymbolizers(iconStyle);
        redliningContainer.setRedlinePointStyle(iconStyle);
        // reapply the styleFn on the layer so that ol3 starts redrawing
        // with new styles
        me.redliningVectorLayer.setStyle(me.redliningVectorLayer.getStyle());
    },

    /**
     *
     */
    getImageAttributes: function() {
        var me = this;
        var fractionX = 1 - (me.down(
            'slider[name=xoffset]')
            .getValue() / 100);
        var fractionY = me.down(
            'slider[name=yoffset]')
            .getValue() / 100;
        var scale = me.down(
           'slider[name=iconscale]')
           .getValue() / 100;
        return [fractionX, fractionY, scale];
    }
});
