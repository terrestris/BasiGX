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
        'BasiGX.view.panel.GraphicPool',
        'BasiGX.util.Color'
    ],

    viewModel: {
        data: {
            pointStyleFieldSetTitle: 'Point Style',
            pointStyleSymbolPanelTitle: 'Symbol',
            pointStyleRadiusNumberFieldLabel: 'Point Radius',
            pointStyleStrokeNumberFieldLabel: 'Stroke Width',
            pointStyleStrokeColorFieldLabel: 'Stroke Color',
            pointStyleFillColorFieldLabel: 'Fill Color',
            pointStyleGraphicPanelTitle: 'Graphic',
            pointStyleChooseImgBtnText: 'Choose Image',
            pointStyleImgOffsetXSliderLabel: 'Graphic Offset X',
            pointStyleImgOffsetYSliderLabel: 'Graphic Offset Y',
            pointStyleImgScaleSliderLabel: 'Scale',
            lineStyleFieldSetTitle: 'LineString Style',
            lineStyleStrokeNumberFieldLabel: 'Stroke Width',
            lineStyleStrokeColorFieldLabel: 'Stroke Color',
            polygonStyleFieldSetTitle: 'Polygon Style',
            polygonStyleStrokeNumberFieldLabel: 'Stroke Width',
            polygonStyleStrokeColorFieldLabel: 'Stroke Color',
            polygonStyleFillColorFieldLabel: 'Fill Color',
            pointGrapicDeletedSuccessMsgText: 'The icon has been deleted. Please reassign a new one.',
            pointGrapicDeletedSuccessMsgTitle: 'Deletion succesfull',
            graphicPoolWindowTitle: 'Graphic Pool'
        }
    },

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
        },
        redlinePointStyle: null,
        redlineLineStringStyle: null,
        redlinePolygonStyle: null
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
    getPointFieldset: function() {
        var me = this,
            style = me.getRedlinePointStyle(),
            imageStyle = style.getImage(),
            imageAnchor,
            imageScale,
            radius = 10,
            strokeWidth = 2,
            fillColor = '#008000',
            strokeColor = '#ffcc33';

        if (imageStyle instanceof ol.style.Icon) {
            imageAnchor = imageStyle.getAnchor();
            imageScale = imageStyle.getScale() * 100;
        } else if (imageStyle instanceof ol.style.Circle) {
            radius = imageStyle.getRadius();
            strokeWidth = imageStyle.getStroke().getWidth();
            fillColor = imageStyle.getFill().getColor();
            fillColor = fillColor.indexOf('rgba') > -1 ? BasiGX.util.Color.
                rgbaToHex(fillColor) : fillColor;
            strokeColor = style.getImage().getStroke().getColor();
            strokeColor = strokeColor.indexOf('rgba') > -1 ? BasiGX.util.Color.
                rgbaToHex(strokeColor) : strokeColor;
        }

        var fs = {
                xtype: 'fieldset',
                bind: {
                    title: '{pointStyleFieldSetTitle}'
                },
                name: 'pointstyle',
                layout: 'hbox',
                items: [
                  {
                     xtype: 'tabpanel',
                     items: [
                         {
                             xtype: 'panel',
                             bind: {
                                 title: '{pointStyleSymbolPanelTitle}'
                             },
                             defaults: {
                                 margin: 3,
                                 width: 220
                             },
                             items: [
                                 {
                                     xtype : 'numberfield',
                                     bind: {
                                         fieldLabel: '{pointStyleRadiusNumberFieldLabel}'
                                     },
                                     name: 'pointradius',
                                     value : radius,
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
                                     bind: {
                                         fieldLabel: '{pointStyleStrokeNumberFieldLabel}'
                                     },
                                     name: 'pointstrokewidth',
                                     value : strokeWidth,
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
                                             bind: {
                                                 value: '{pointStyleStrokeColorFieldLabel}'
                                             }
                                         },{
                                            xtype : 'colorbutton',
                                            name: 'pointstrokecolor',
                                            format: 'hex8',
                                            value : strokeColor,
                                            margin: '5 0 0 10',
                                            listeners: {
                                                change: function(field, val,
                                                    oldVal) {
                                                    if (oldVal) {
                                                        var color =
                                                            BasiGX.util.Color
                                                            .hex8ToRgba(val);
                                                        me.updateStyle(
                                                            {strokecolor: color}
                                                        );
                                                    }
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
                                             bind: {
                                                 value: '{pointStyleFillColorFieldLabel}'
                                             }
                                         },{
                                            xtype : 'colorbutton',
                                            name: 'pointfillcolor',
                                            format: 'hex8',
                                            margin: '0 0 0 10',
                                            value : fillColor,
                                            listeners: {
                                                change: function(field, val,
                                                    oldVal) {
                                                    if (oldVal) {
                                                        var color =
                                                            BasiGX.util.Color
                                                            .hex8ToRgba(val);
                                                        me.updateStyle(
                                                            {fillcolor: color}
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                     ]
                                 }
                             ]
                         },
                         {
                             xtype: 'panel',
                             bind: {
                                 title: '{pointStyleGraphicPanelTitle}'
                             },
                             name: 'pointgraphic',
                             defaults: {
                                 margin: 3,
                                 width: 220
                             },
                             items: [
                                 {
                                     xtype : 'button',
                                     bind: {
                                         text: '{pointStyleChooseImgBtnText}'
                                     },
                                     handler: me.onChooseGraphicClick,
                                     scope: me
                                 },
                                 {
                                     xtype: 'slider',
                                     bind: {
                                         fieldLabel: '{pointStyleImgOffsetXSliderLabel}'
                                     },
                                     name: 'xoffset',
                                     value: imageAnchor ? imageAnchor[0] : 50,
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
                                     bind: {
                                         fieldLabel: '{pointStyleImgOffsetYSliderLabel}'
                                     },
                                     name: 'yoffset',
                                     value: imageAnchor ? imageAnchor[1] : 50,
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
                                    bind: {
                                        fieldLabel: '{pointStyleImgScaleSliderLabel}'
                                    },
                                    name: 'iconscale',
                                    value: imageScale ? imageScale : 100,
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
            style = me.getRedlineLineStringStyle(),
            styleStrokeColor = style.getStroke().getColor(),
            strokeColor = styleStrokeColor.indexOf('rgba') > -1 ?
                BasiGX.util.Color.rgbaToHex(styleStrokeColor) : styleStrokeColor,
            fs = {
                xtype: 'fieldset',
                bind: {
                    title: '{lineStyleFieldSetTitle}'
                },
                name: 'linestringstyle',
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
                             bind: {
                                 fieldLabel: '{lineStyleStrokeNumberFieldLabel}'
                             },
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
                                     bind: {
                                         value: '{lineStyleStrokeColorFieldLabel}'
                                     }
                                 },{
                                    xtype : 'colorbutton',
                                    format: 'hex8',
                                    value : strokeColor,
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
            style = me.getRedlinePolygonStyle(),
            styleFillColor = style.getFill().getColor(),
            fillColor = styleFillColor.indexOf('rgba') > -1 ?
                BasiGX.util.Color.rgbaToHex(styleFillColor) : styleFillColor,
            styleStrokeColor = style.getStroke().getColor(),
            strokeColor = styleStrokeColor.indexOf('rgba') > -1 ?
                BasiGX.util.Color.rgbaToHex(styleStrokeColor) : styleStrokeColor,
            fs = {
                xtype: 'fieldset',
                bind: {
                    title: '{polygonStyleFieldSetTitle}'
                },
                name: 'polygonstyle',
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
                             bind: {
                                 fieldLabel: '{polygonStyleStrokeNumberFieldLabel}'
                             },
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
                                     bind: {
                                         value: '{polygonStyleStrokeColorFieldLabel}'
                                     }
                                 },{
                                    xtype : 'colorbutton',
                                    format: 'hex8',
                                    value : strokeColor,
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
                                     bind: {
                                         value: '{polygonStyleFillColorFieldLabel}'
                                     }
                                 },{
                                    xtype : 'colorbutton',
                                    format: 'hex8',
                                    margin: '0 0 0 10',
                                    value : fillColor,
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
            oldStyle = me.getRedlinePointStyle();
            renderer = me.down('gx_renderer[name=pointRenderPreview]');
            style = me.generatePointStyle(oldStyle, pointStyle);
            me.setRedlinePointStyle(style);
            redliningContainer.setRedlinePointStyle(style);
        } else if (lineStyle) {
            oldStyle = me.getRedlineLineStringStyle();
            renderer = me.down('gx_renderer[name=lineRenderPreview]');
            style = me.generateLineStringStyle(oldStyle, lineStyle);
            me.setRedlineLineStringStyle(style);
            redliningContainer.setRedlineLineStringStyle(style);
        } else {
            oldStyle = me.getRedlinePolygonStyle();
            renderer = me.down('gx_renderer[name=polygonRenderPreview]');
            style = me.generatePolygonStyle(oldStyle, polygonStyle);
            me.setRedlinePolygonStyle(style);
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
        var fallBackRadius = 7;
        var fallBackFillColor = '#008000';
        var fallBackStrokeColor = '#ffcc33';
        var fallBackStrokeWidth = 2;
        var oldImage = oldStyle.getImage();
        if (oldImage && oldImage.getRadius) {
            fallBackRadius = oldImage.getRadius();
        }
        if (oldImage && oldImage.getFill && oldImage.getFill() &&
            oldImage.getFill().getColor) {
            fallBackFillColor = oldImage.getFill().getColor();
        }
        if (oldImage && oldImage.getStroke && oldImage.getStroke() &&
            oldImage.getStroke().getColor) {
            fallBackStrokeColor = oldImage.getStroke().getColor();
        }
        if (oldImage && oldImage.getStroke && oldImage.getStroke() &&
            oldImage.getStroke().getWidth) {
            fallBackStrokeWidth = oldImage.getStroke().getWidth();
        }
        var style = new ol.style.Style({
            image: pointStyle.radius || pointStyle.fillcolor ||
            pointStyle.fillopacity || pointStyle.strokewidth ||
            pointStyle.strokecolor ?
            new ol.style.Circle({
                radius: pointStyle.radius || fallBackRadius,
                fill: new ol.style.Fill({
                    color: pointStyle.fillcolor ? pointStyle.fillcolor :
                        fallBackFillColor
                }),
                stroke: new ol.style.Stroke({
                    color: pointStyle.strokecolor ? pointStyle.strokecolor :
                        fallBackStrokeColor,
                    width: pointStyle.strokewidth ? pointStyle.strokewidth :
                        fallBackStrokeWidth
                })
            }) : oldImage
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
            me.setRedlinePointStyle(imageStyle);
            // reapply the styleFn on the layer so that ol3 starts redrawing
            // with new styles
            me.redliningVectorLayer.setStyle(me.redliningVectorLayer.getStyle());
            renderer.setSymbolizers(imageStyle);
        };

        var deleteClickCallbackFn = function() {
            Ext.toast(
                me.getViewModel().get('pointGrapicDeletedSuccessMsgText'),
                me.getViewModel().get('pointGrapicDeletedSuccessMsgTitle'),
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
            title: me.getViewModel().get('graphicPoolWindowTitle'),
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
        var oldStyle = me.getRedlinePointStyle().getImage();
        // just set a new style if an icon style has already been set
        if (!(oldStyle instanceof ol.style.Icon)) {
            return;
        }
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
        me.setRedlinePointStyle(iconStyle);
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
    },

    /**
     * Method return the current state of the redlining styles
     */
    getState: function() {
        var me = this;

        var state = {
            pointStyle: me.getRedlinePointStyle(),
            lineStyle: me.getRedlineLineStringStyle(),
            polygonStyle: me.getRedlinePolygonStyle()
        };

        return state;
    },

    /**
     * Method set the state of the redlining styles
     */
    setState: function(state) {
        var me = this;
        var redliningContainer = Ext.ComponentQuery.query(
            'basigx-container-redlining')[0];
        if (state.pointStyle) {
            me.setRedlinePointStyle(state.pointStyle);
            redliningContainer.setRedlinePointStyle(state.pointStyle);
            var pointFieldSet = me.down('fieldset[name=pointstyle]');
            if (pointFieldSet) {
                pointFieldSet.destroy();
                var anotherPointFieldSet = this.getPointFieldset();
                me.insert(0, anotherPointFieldSet);
                var isIconStyle = state.pointStyle.getImage() instanceof
                    ol.style.Icon;
                if (isIconStyle) {
                    var iconTab = me.down('panel[name=pointgraphic]');
                    var tabPanel = me.down('fieldset[name=pointstyle]').down(
                        'tabpanel');
                    tabPanel.setActiveTab(iconTab);
                }
            }
        }

        if (state.lineStyle) {
            me.setRedlineLineStringStyle(state.lineStyle);
            redliningContainer.setRedlineLineStringStyle(state.lineStyle);
            var lineStringFieldSet = me.down('fieldset[name=linestringstyle]');
            if (lineStringFieldSet) {
                lineStringFieldSet.destroy();
                me.insert(1, this.getLineStringFieldset());
            }
        }

        if (state.polygonStyle) {
            me.setRedlinePolygonStyle(state.polygonStyle);
            redliningContainer.setRedlinePolygonStyle(state.polygonStyle);
            var polygonFieldSet = me.down('fieldset[name=polygonstyle]');
            if (polygonFieldSet) {
                polygonFieldSet.destroy();
                me.insert(2, this.getPolygonFieldset());
            }
        }
    }
});
