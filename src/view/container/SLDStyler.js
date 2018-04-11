/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * SLD Styler
 *
 * Used in combination with a GeoServer to edit SLD styles and preview
 * or save them
 *
 * @example:
 * var styleEditor = {
 *     xtype: 'basigx-container-sldstyler',
 *     backendUrls: {
 *        pictureList: {
 *            url: 'rest/images',
 *            method: 'GET'
 *        },
 *        pictureSrc: {
 *            url: 'image/getThumbnail.action?id='
 *        },
 *        pictureUpload: {
 *            url: 'image/upload.action?'
 *        },
 *        graphicDelete: {
 *            url: 'rest/images/',
 *            method: 'DELETE'
 *        },
 *        geoServerUrl: BasiGX.util.Url.getWebProjectBaseUrl() +
 *            'geoserver.action',
 *        internalUrl: 'http://shogun-webapp.internal/'
 *     },
 *     layer: 'namespace:layer',
 *     sld: '<xml ...?>',
 *     ruleName: 'rule1',
 *     mode: 'polygon'
 * };
 *
 * @author Johannes Weskamm
 * @class BasiGX.view.container.SLDStyler
 */
Ext.define('BasiGX.view.container.SLDStyler', {
    extend: 'Ext.container.Container',
    xtype: 'basigx-container-sldstyler',

    requires: [
        'Ext.ux.colorpick.Button',
        'BasiGX.view.panel.GraphicPool',
        'BasiGX.view.panel.FontSymbolPool',
        'BasiGX.util.Color',
        'BasiGX.util.SLD',
        'BasiGX.util.Object'
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
            pointStyleChooseFontBtnText: 'Choose Font Symbol',
            pointStyleImgScaleSliderLabel: 'Scale',
            pointStyleImgRotationSliderLabel: 'Rotation',
            pointStyleImgOpacitySliderLabel: 'Opacity',
            lineStyleFieldSetTitle: 'LineString Style',
            lineStyleStrokeNumberFieldLabel: 'Stroke Width',
            lineStyleStrokeColorFieldLabel: 'Stroke Color',
            polygonStyleFieldSetTitle: 'Polygon Style',
            polygonStyleSymbolPanelTitle: 'Symbol',
            polygonStyleStrokeNumberFieldLabel: 'Stroke Width',
            polygonStyleStrokeColorFieldLabel: 'Stroke Color',
            polygonStyleFillColorFieldLabel: 'Fill Color',
            polygonStyleGraphicPanelTitle: 'Graphic',
            polygonStyleImgScaleSliderLabel: 'Scale',
            polygonStyleImgRotationSliderLabel: 'Rotation',
            polygonStyleImgOpacitySliderLabel: 'Opacity',
            pointGrapicDeletedSuccessMsgText: 'The icon has been deleted. ' +
                'Please reassign a new one.',
            pointGrapicDeletedSuccessMsgTitle: 'Deletion succesfull',
            graphicPoolWindowTitle: 'Graphic Pool',
            fontSymbolPoolWindowTitle: 'Font symbol pool',
            documentation: '<h2>SLD Styler</h2>• Verwenden Sie den ' +
                'SLD Styler, um Ihre Zeichenobjekte nach Wunsch zu gestalten.' +
                '<br>• Neben Farben, Strichstärken und Schrifteigenschaften ' +
                'können auch eigene Icons für die Symbolisierung verwendet ' +
                'werden'
        }
    },

    /**
     *
     */
    padding: 5,

    /**
     *
     */
    config: {
        /**
         *
         */
        backendUrls: {
            /**
             * The URL to retrieve all images with resource link as JSON
             */
            pictureList: null,
            /**
             * The URL to retrieve an image as thumbnail
             */
            pictureSrc: null,
            /**
             * The URL to upload an image
             */
            pictureUpload: null,
            /**
             * The URL to delete an image
             */
            graphicDelete: null,
            /**
             * The URL of the GeoServer to use
             */
            geoServerUrl: null,
            /**
             * The REST URL of the GeoServer to retrieve all available fonts.
             * E.g. http://localhost:8080/geoserver/rest/resource/fonts
             * would list all fonts from the GEOSERVER_DATA_DIR/fonts directory
             */
            geoserverFontListUrl: null,
            /**
             * The REST URL of the GeoServer to retrieve a specific font. E.g.
             * http://localhost:8080/geoserver/rest/resource/fonts/Arial.ttf
             * would retrieve the specific font from the
             * GEOSERVER_DATA_DIR/fonts directory
             */
            geoserverFontUrl: null,

            /**
             * If set, this URL is used when creating the SLD instead of the
             * BasiGX project base url from window.location.
             * @type {String}
             */
            internalUrl: null
        },
        /**
         * The mode indicates if we are styling a `point`, `line` or `polygon`
         */
        mode: 'point',

        /**
         * The full qualified layerName of the layer in GeoServer
         */
        layer: null,

        /**
         * The SLD this component shall use
         */
        sld: null,

        /**
         * The name of the rule of the SLD we want to handle
         */
        ruleName: null,

        /**
         * The rule Object. Gets set on update of style
         */
        rule: null,

        /**
         * The SLD javascript Object
         */
        sldObj: null
    },

    /**
     * @param {Object} config The configuration object for the SLD styler.
     */
    initComponent: function() {
        var sld = this.getSld();
        if (!sld) {
            Ext.log.warn('Component needs to be configured with a valid SLD');
            return;
        }
        this.callParent();
        this.setSldObj(BasiGX.util.SLD.toSldObject(sld));

        if (this.getMode() === 'point') {
            this.add(this.getPointFieldset());
        } else if (this.getMode() === 'line') {
            this.add(this.getLineStringFieldset());
        } else if (this.getMode() === 'polygon') {
            this.add(this.getPolygonFieldset());
        }

        // activate the graphic tab if necessary
        var usingExternalGraphic = false;
        var graphicOrMark = BasiGX.util.Object.getValue(
            'externalGraphicOrMark', this.getSldObj());
        if (graphicOrMark && graphicOrMark[0] &&
           (graphicOrMark[0].onlineResource ||
           (graphicOrMark[0].wellKnownName &&
            graphicOrMark[0].wellKnownName.content[0]
                .indexOf('ttf://') > -1))) {
            usingExternalGraphic = true;
        }
        if (usingExternalGraphic) {
            var externalGrphicPanel = this.down('panel[name=graphic]');
            this.down('tabpanel').setActiveItem(externalGrphicPanel);
        }
        this.updateSLDPreview();
    },

    /**
     * Returns a configuration object for an ExtJS fieldset for styling points
     * which can e.g. be used inside the `items` config.
     *
     * @return {Object} A configuration for an ExtJS fieldset for styling
     *     points.
     */
    getPointFieldset: function() {
        var me = this;
        var sldObj = me.getSldObj();
        var getVal = BasiGX.util.Object.getValue;
        var rule = BasiGX.util.SLD.getRuleByName(me.getRuleName(), sldObj);
        var listenerConfig = {
            change: me.updateSLDPreview,
            scope: me
        };

        if (!rule) {
            // take the first available rule to show an initial render
            // for e.g. new created rules that are not persisted yet
            var availableRules = BasiGX.util.SLD.rulesFromSldObject(sldObj);
            rule = availableRules[0];
        }

        var strokeWidth = BasiGX.util.SLD.DEFAULT_STROKE_WIDTH;
        var strokeOpacity = BasiGX.util.SLD.DEFAULT_STROKE_OPACITY;
        var strokeColor = BasiGX.util.SLD.DEFAULT_STROKE_COLOR;
        var fillColor = BasiGX.util.SLD.DEFAULT_FILL_COLOR;
        var fillOpacity = BasiGX.util.SLD.DEFAULT_FILL_OPACITY;
        var radius = BasiGX.util.SLD.DEFAULT_POINT_RADIUS;
        var graphicSize = BasiGX.util.SLD.DEFAULT_GRAPHIC_SIZE;
        var graphicOpacity = BasiGX.util.SLD.DEFAULT_GRAPHIC_OPACITY * 100;
        var graphicRotation = BasiGX.util.SLD.DEFAULT_GRAPHIC_ROTATION;
        var externalGraphicSrc = null;
        var fontAndUniCode = null;
        var alpha;

        var fill = getVal('fill', rule);
        var stroke = getVal('stroke', rule);
        var size = getVal('size', rule);
        var graphic = getVal('graphic', rule);

        if (fill) {
            fillColor = BasiGX.util.SLD.fillFromObj(fill).fillColor;
            fillOpacity = BasiGX.util.SLD.fillFromObj(fill).fillOpacity;
            alpha = BasiGX.util.Color.makeHex('' +
                Math.round(parseFloat(fillOpacity) * 255));
            fillColor = fillColor + alpha;
        }

        if (stroke) {
            strokeWidth = BasiGX.util.SLD.strokeFromObj(stroke).strokeWidth;
            strokeOpacity = BasiGX.util.SLD.strokeFromObj(stroke).strokeOpacity;
            strokeColor = BasiGX.util.SLD.strokeFromObj(stroke).strokeColor;
            alpha = BasiGX.util.Color.makeHex('' +
                Math.round(parseFloat(strokeOpacity) * 255));
            strokeColor = strokeColor + alpha;
        }

        if (size) {
            radius = parseInt(size.content[0], 10);
        }

        if (graphic) {
            if (getVal('size', graphic)) {
                graphicSize = getVal('size', graphic).content[0];
            }
            if (getVal('opacity', graphic)) {
                graphicOpacity = getVal('opacity', graphic).content[0] * 100;
            }
            if (getVal('rotation', graphic)) {
                graphicRotation = getVal('rotation', graphic).content[0];
            }
            if (getVal('href', graphic)) {
                externalGraphicSrc = getVal('href', graphic);
            }
            if (getVal('wellKnownName', graphic)) {
                var content = getVal('wellKnownName', graphic).content[0];
                if (content.indexOf('ttf://') > -1) {
                    fontAndUniCode = getVal('wellKnownName', graphic)
                        .content[0];
                }
            }
        }

        var fs = {
            xtype: 'fieldset',
            bind: {
                title: '{pointStyleFieldSetTitle}'
            },
            name: 'pointstyle',
            layout: 'hbox',
            items: [{
                xtype: 'tabpanel',
                items: [{
                    xtype: 'panel',
                    bind: {
                        title: '{pointStyleSymbolPanelTitle}'
                    },
                    defaults: {
                        margin: 3,
                        width: 220
                    },
                    items: [{
                        xtype: 'numberfield',
                        bind: {
                            fieldLabel: '{pointStyleRadiusNumberFieldLabel}'
                        },
                        name: 'radius',
                        value: radius,
                        minValue: 1,
                        maxValue: 50,
                        listeners: listenerConfig
                    }, {
                        xtype: 'numberfield',
                        bind: {
                            fieldLabel: '{pointStyleStrokeNumberFieldLabel}'
                        },
                        name: 'stroke-width',
                        value: strokeWidth,
                        minValue: 0,
                        maxValue: 50,
                        listeners: listenerConfig
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            width: 100,
                            bind: {
                                value: '{pointStyleStrokeColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            name: 'stroke',
                            format: 'hex8',
                            value: strokeColor,
                            margin: '5 0 0 10',
                            listeners: listenerConfig
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            width: 100,
                            bind: {
                                value: '{pointStyleFillColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            name: 'fill',
                            format: 'hex8',
                            margin: '0 0 0 10',
                            value: fillColor,
                            listeners: listenerConfig
                        }]
                    }]
                }, {
                    xtype: 'panel',
                    bind: {
                        title: '{pointStyleGraphicPanelTitle}'
                    },
                    name: 'graphic',
                    externalGraphicSrc: externalGraphicSrc,
                    fontAndUniCode: fontAndUniCode,
                    defaults: {
                        margin: 3,
                        width: 220
                    },
                    layout: 'vbox',
                    items: [{
                        xtype: 'button',
                        bind: {
                            text: '{pointStyleChooseImgBtnText}'
                        },
                        handler: me.onChooseGraphicClick,
                        scope: me
                    }, {
                        xtype: 'button',
                        bind: {
                            text: '{pointStyleChooseFontBtnText}'
                        },
                        handler: me.onChooseFontClick,
                        scope: me
                    }, {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{pointStyleImgOpacitySliderLabel}'
                        },
                        name: 'graphic-opacity',
                        value: graphicOpacity,
                        disabled: fontAndUniCode ? true : false,
                        minValue: 0,
                        maxValue: 100,
                        increment: 10,
                        listeners: listenerConfig
                    }, {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{pointStyleImgRotationSliderLabel}'
                        },
                        name: 'graphic-rotation',
                        value: graphicRotation,
                        minValue: 0,
                        maxValue: 360,
                        listeners: listenerConfig
                    }, {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{pointStyleImgScaleSliderLabel}'
                        },
                        name: 'graphic-scale',
                        value: graphicSize,
                        increment: 1,
                        minValue: 1,
                        maxValue: 100,
                        listeners: listenerConfig
                    }, {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{pointStyleStrokeNumberFieldLabel}'
                        },
                        name: 'stroke-width',
                        value: strokeWidth,
                        disabled: externalGraphicSrc ? true : false,
                        minValue: 0,
                        maxValue: 50,
                        listeners: listenerConfig
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            disabled: externalGraphicSrc ? true : false,
                            width: 100,
                            bind: {
                                value: '{pointStyleStrokeColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            disabled: externalGraphicSrc ? true : false,
                            name: 'stroke',
                            format: 'hex8',
                            value: strokeColor,
                            margin: '5 0 0 10',
                            listeners: listenerConfig
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        disabled: externalGraphicSrc ? true : false,
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            disabled: externalGraphicSrc ? true : false,
                            width: 100,
                            bind: {
                                value: '{pointStyleFillColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            disabled: externalGraphicSrc ? true : false,
                            name: 'fill',
                            format: 'hex8',
                            margin: '0 0 0 10',
                            value: fillColor,
                            listeners: listenerConfig
                        }]
                    }]
                }]
            }, me.createSLDPreviewPanel()]
        };
        return fs;
    },

    /**
     * Returns a configuration object for an ExtJS fieldset for styling
     * linestrings which can e.g. be used inside the `items` config.
     *
     * @return {Object} A configuration for an ExtJS fieldset for styling
     *     linestrings.
     */
    getLineStringFieldset: function() {
        var me = this;
        var sldObj = me.getSldObj();
        var getVal = BasiGX.util.Object.getValue;
        var rule = BasiGX.util.SLD.getRuleByName(me.getRuleName(), sldObj);
        var listenerConfig = {
            change: me.updateSLDPreview,
            scope: me
        };

        if (!rule) {
            // take the first available rule to show an initial render
            // for e.g. new created rules that are not persisted yet
            var availableRules = BasiGX.util.SLD.rulesFromSldObject(sldObj);
            rule = availableRules[0];
        }

        var strokeWidth = BasiGX.util.SLD.DEFAULT_STROKE_WIDTH;
        var strokeOpacity = BasiGX.util.SLD.DEFAULT_STROKE_OPACITY;
        var strokeColor = BasiGX.util.SLD.DEFAULT_STROKE_COLOR;

        var stroke = getVal('stroke', rule);

        if (stroke) {
            strokeWidth = BasiGX.util.SLD.strokeFromObj(stroke).strokeWidth;
            strokeOpacity = BasiGX.util.SLD.strokeFromObj(stroke).strokeOpacity;
            strokeColor = BasiGX.util.SLD.strokeFromObj(stroke).strokeColor;
            var alpha = BasiGX.util.Color.makeHex('' +
                Math.round(parseFloat(strokeOpacity) * 255));
            strokeColor = strokeColor + alpha;
        }

        var fs = {
            xtype: 'fieldset',
            bind: {
                title: '{lineStyleFieldSetTitle}'
            },
            name: 'linestyle',
            layout: 'hbox',
            items: [{
                xtype: 'fieldset',
                layout: 'vbox',
                width: 220,
                defaults: {
                    margin: 3,
                    width: 180
                },
                items: [{
                    xtype: 'numberfield',
                    bind: {
                        fieldLabel: '{lineStyleStrokeNumberFieldLabel}'
                    },
                    value: strokeWidth,
                    name: 'stroke-width',
                    minValue: 0,
                    maxValue: 50,
                    listeners: listenerConfig
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    defaults: {
                        width: 100
                    },
                    items: [{
                        xtype: 'displayfield',
                        width: 100,
                        bind: {
                            value: '{lineStyleStrokeColorFieldLabel}'
                        }
                    }, {
                        xtype: 'colorbutton',
                        format: 'hex8',
                        value: strokeColor,
                        name: 'stroke',
                        margin: '5 0 0 10',
                        listeners: listenerConfig
                    }]
                }]
            }, me.createSLDPreviewPanel()]
        };
        return fs;
    },

    /**
     * Returns a configuration object for an ExtJS fieldset for styling
     * polygons which can e.g. be used inside the `items` config.
     *
     * @return {Object} A configuration for an ExtJS fieldset for styling
     *     polygon.
     */
    getPolygonFieldset: function() {
        var me = this;
        var sldObj = me.getSldObj();
        var getVal = BasiGX.util.Object.getValue;
        var rule = BasiGX.util.SLD.getRuleByName(me.getRuleName(), sldObj);
        var listenerConfig = {
            change: me.updateSLDPreview,
            scope: me
        };

        if (!rule) {
            // take the first available rule to show an initial render
            // for e.g. new created rules that are not persisted yet
            var availableRules = BasiGX.util.SLD.rulesFromSldObject(sldObj);
            rule = availableRules[0];
        }

        var strokeWidth = BasiGX.util.SLD.DEFAULT_STROKE_WIDTH;
        var strokeOpacity = BasiGX.util.SLD.DEFAULT_STROKE_OPACITY;
        var strokeColor = BasiGX.util.SLD.DEFAULT_STROKE_COLOR;
        var fillColor = BasiGX.util.SLD.DEFAULT_FILL_COLOR;
        var fillOpacity = BasiGX.util.SLD.DEFAULT_FILL_OPACITY;
        var graphicSize = BasiGX.util.SLD.DEFAULT_GRAPHIC_SIZE;
        var graphicOpacity = BasiGX.util.SLD.DEFAULT_GRAPHIC_OPACITY * 100;
        var graphicRotation = BasiGX.util.SLD.DEFAULT_GRAPHIC_ROTATION;
        var externalGraphicSrc = null;
        var fontAndUniCode = null;
        var alpha;

        var fill = getVal('fill', rule);
        var stroke = getVal('stroke', rule);
        var graphic = getVal('graphic', rule);

        if (fill) {
            fillColor = BasiGX.util.SLD.fillFromObj(fill).fillColor;
            fillOpacity = BasiGX.util.SLD.fillFromObj(fill).fillOpacity;
            alpha = BasiGX.util.Color.makeHex('' +
                Math.round(parseFloat(fillOpacity) * 255));
            fillColor = fillColor + alpha;
        }

        if (stroke) {
            strokeWidth = BasiGX.util.SLD.strokeFromObj(stroke).strokeWidth;
            strokeOpacity = BasiGX.util.SLD.strokeFromObj(stroke).strokeOpacity;
            strokeColor = BasiGX.util.SLD.strokeFromObj(stroke).strokeColor;
            alpha = BasiGX.util.Color.makeHex('' +
                Math.round(parseFloat(strokeOpacity) * 255));
            strokeColor = strokeColor + alpha;
        }

        if (graphic) {
            if (getVal('size', graphic)) {
                graphicSize = getVal('size', graphic).content[0];
            }
            if (getVal('opacity', graphic)) {
                graphicOpacity = getVal('opacity', graphic).content[0] * 100;
            }
            if (getVal('rotation', graphic)) {
                graphicRotation = getVal('rotation', graphic).content[0];
            }
            if (getVal('href', graphic)) {
                externalGraphicSrc = getVal('href', graphic);
            }
            if (getVal('wellKnownName', graphic)) {
                var content = getVal('wellKnownName', graphic).content[0];
                if (content.indexOf('ttf://') > -1) {
                    fontAndUniCode = getVal('wellKnownName', graphic)
                        .content[0];
                }
            }
        }

        var fs = {
            xtype: 'fieldset',
            bind: {
                title: '{polygonStyleFieldSetTitle}'
            },
            name: 'polygonstyle',
            layout: 'hbox',
            items: [{
                xtype: 'tabpanel',
                items: [{
                    xtype: 'panel',
                    bind: {
                        title: '{polygonStyleSymbolPanelTitle}'
                    },
                    layout: 'vbox',
                    width: 220,
                    defaults: {
                        margin: 3,
                        width: 210
                    },
                    items: [{
                        xtype: 'numberfield',
                        bind: {
                            fieldLabel: '{polygonStyleStrokeNumberFieldLabel}'
                        },
                        value: strokeWidth,
                        name: 'stroke-width',
                        allowDecimals: true,
                        decimalPrecision: 1,
                        decimalSeparator: '.',
                        minValue: 0,
                        maxValue: 50,
                        listeners: listenerConfig
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            width: 100,
                            bind: {
                                value: '{polygonStyleStrokeColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            format: 'hex8',
                            value: strokeColor,
                            name: 'stroke',
                            margin: '5 0 0 10',
                            listeners: listenerConfig
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            width: 100,
                            bind: {
                                value: '{polygonStyleFillColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            format: 'hex8',
                            margin: '0 0 0 10',
                            value: fillColor,
                            name: 'fill',
                            listeners: listenerConfig
                        }]
                    }]
                }, {
                    xtype: 'panel',
                    bind: {
                        title: '{polygonStyleGraphicPanelTitle}'
                    },
                    name: 'graphic',
                    layout: 'vbox',
                    externalGraphicSrc: externalGraphicSrc,
                    fontAndUniCode: fontAndUniCode,
                    defaults: {
                        margin: 3,
                        width: 210
                    },
                    items: [{
                        xtype: 'button',
                        bind: {
                            text: '{pointStyleChooseImgBtnText}'
                        },
                        handler: me.onChooseGraphicClick,
                        scope: me
                    }, {
                        xtype: 'button',
                        bind: {
                            text: '{pointStyleChooseFontBtnText}'
                        },
                        handler: me.onChooseFontClick,
                        scope: me
                    },
                    // opacity seems to be unsupported for external graphics /
                    // graphic fills, although its valid in SLD.
                    {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{polygonStyleImgOpacitySliderLabel}'
                        },
                        name: 'graphic-opacity',
                        value: graphicOpacity,
                        disabled: true,
                        minValue: 0,
                        maxValue: 100,
                        increment: 10,
                        listeners: listenerConfig
                    },
                    {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{polygonStyleImgRotationSliderLabel}'
                        },
                        name: 'graphic-rotation',
                        value: graphicRotation,
                        disabled: externalGraphicSrc ? true : false,
                        minValue: 0,
                        maxValue: 360,
                        listeners: listenerConfig
                    }, {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{polygonStyleImgScaleSliderLabel}'
                        },
                        name: 'graphic-scale',
                        value: graphicSize,
                        increment: 1,
                        minValue: 1,
                        maxValue: 200,
                        listeners: listenerConfig
                    }, {
                        xtype: 'slider',
                        bind: {
                            fieldLabel: '{polygonStyleStrokeNumberFieldLabel}'
                        },
                        name: 'stroke-width',
                        value: strokeWidth,
                        disabled: externalGraphicSrc ? true : false,
                        minValue: 0,
                        maxValue: 10,
                        listeners: listenerConfig
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            disabled: externalGraphicSrc ? true : false,
                            width: 100,
                            bind: {
                                value: '{polygonStyleStrokeColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            disabled: externalGraphicSrc ? true : false,
                            name: 'stroke',
                            format: 'hex8',
                            value: strokeColor,
                            margin: '5 0 0 10',
                            listeners: listenerConfig
                        }]
                    }, {
                        xtype: 'container',
                        layout: 'hbox',
                        defaults: {
                            width: 100
                        },
                        items: [{
                            xtype: 'displayfield',
                            disabled: externalGraphicSrc ? true : false,
                            width: 100,
                            bind: {
                                value: '{polygonStyleFillColorFieldLabel}'
                            }
                        }, {
                            xtype: 'colorbutton',
                            disabled: externalGraphicSrc ? true : false,
                            name: 'fill',
                            format: 'hex8',
                            margin: '0 0 0 10',
                            value: fillColor,
                            listeners: listenerConfig
                        }]
                    }]
                }]
            }, me.createSLDPreviewPanel()]
        };
        return fs;
    },

    /**
     * Creates an image-panel to preview the current SLD
     *
     * @return {Object} An ExtJS configuration object for the image panel
     */
    createSLDPreviewPanel: function() {
        var panel = {
            xtype: 'image',
            name: 'sldpreview-' + this.getMode(),
            src: null,
            width: 200,
            minHeight: 80
        };
        return panel;
    },

    /**
     * Method updates the SLD Preview with the current state of the form values
     */
    updateSLDPreview: function() {
        var me = this;
        var selector = 'image[name=sldpreview-' + this.getMode() + ']';
        var imagePanel = Ext.ComponentQuery.query(selector)[0];

        var sld = me.getSldFromFormValues();
        var ruleName = me.getRuleName();
        var layer = me.getLayer();
        var geoServerUrl = me.getBackendUrls().geoServerUrl;

        if (imagePanel) {
            Ext.Ajax.request({
                binary: true,
                url: geoServerUrl,
                method: 'POST',
                params: {
                    service: 'WMS',
                    request: 'GetLegendGraphic',
                    layer: layer,
                    version: '1.1.1',
                    format: 'image/png',
                    width: 190,
                    height: 190,
                    rule: ruleName,
                    sld_body: sld
                },
                defaultHeaders: BasiGX.util.CSRF.getHeader(),
                scope: this,
                success: function(response) {
                    var blob = new Blob(
                        [response.responseBytes],
                        {type: 'image/png'}
                    );
                    var url = window.URL.createObjectURL(blob);
                    imagePanel.setSrc(url);
                },
                failure: function() {
                    Ext.toast('Error retrieving the SLD-Graphic preview');
                }
            });
        }
    },

    /**
     * Method transforms the current form values into a valid SLD string,
     * which is then used to preview the current style with the help of an
     * `GetLegendGraphic` request issued against the GeoServer
     *
     * @return {String} sld The SLD string representing the current state of
     *     the form values
     */
    getSldFromFormValues: function() {
        var me = this;
        var selector = 'fieldset[name=' + this.getMode() + 'style]';
        var fs = Ext.ComponentQuery.query(selector)[0];
        var sldObj = this.getSldObj();
        var value;
        if (!fs || !sldObj) {
            return '';
        }

        var radiusFs = fs.down('[name=radius]');
        var graphicTab = fs.down('[name=graphic]');
        var graphicTabActive = false;

        if (graphicTab) {
            var activeTab = graphicTab.up('tabpanel').getActiveTab();
            if (activeTab === graphicTab) {
                graphicTabActive = true;
            }
        }

        var fillFs = graphicTabActive ? graphicTab.down('[name=fill]') :
            fs.down('[name=fill]');
        var strokeFs = graphicTabActive ? graphicTab.down('[name=stroke]') :
            fs.down('[name=stroke]');
        var strokeWidthFs = graphicTabActive ?
            graphicTab.down('[name=stroke-width]') :
            fs.down('[name=stroke-width]');

        var symbolizerObj = {};

        if (fillFs) {
            symbolizerObj.fillColor = '#' + fillFs.getValue().substring(0, 6);
            symbolizerObj.fillOpacity = BasiGX.util.Color.rgbaAsArray(
                BasiGX.util.Color.hex8ToRgba(fillFs.getValue()))[4];
        }

        if (strokeFs) {
            symbolizerObj.strokeColor = '#' + strokeFs.getValue()
                .substring(0, 6);
            symbolizerObj.strokeOpacity = BasiGX.util.Color.rgbaAsArray(
                BasiGX.util.Color.hex8ToRgba(strokeFs.getValue()))[4];
        }

        if (strokeWidthFs) {
            value = strokeWidthFs.getValue();
            if (Ext.isNumber(value)) {
                symbolizerObj.strokeWidth = value.toString();
            } else {
                symbolizerObj.strokeWidth =
                    BasiGX.util.SLD.DEFAULT_STROKE_WIDTH.toString();
            }
        }

        if (!graphicTabActive && radiusFs) {
            value = radiusFs.getValue();
            if (Ext.isNumber(value)) {
                symbolizerObj.radius = value.toString();
            } else {
                symbolizerObj.radius =
                    BasiGX.util.SLD.DEFAULT_POINT_RADIUS.toString();
            }
        }

        if (graphicTabActive) {
            // only write external graphic or font values when the graphic
            // tab is active
            var scale = graphicTab.down('[name=graphic-scale]').getValue();
            var opacity = graphicTab.down('[name=graphic-opacity]')
                .getValue() / 100;
            var rotation = graphicTab.down('[name=graphic-rotation]')
                .getValue();
            if (graphicTab.externalGraphicSrc) {
                var src = graphicTab.externalGraphicSrc;
                var internalUrl = this.config.backendUrls.internalUrl;
                var regex = /https?\:\/\/[a-zA-Z\-_0-9.]+\//g;
                if (this.config.backendUrls.internalUrl) {
                    src = src.replace(regex, internalUrl);
                }
                symbolizerObj.externalGraphicSrc = src;
            }
            if (graphicTab.fontAndUniCode) {
                symbolizerObj.fontAndUniCode = graphicTab.fontAndUniCode;
            }
            symbolizerObj.graphicSize = scale ? scale.toString() :
                BasiGX.util.SLD.DEFAULT_GRAPHIC_SIZE.toString();
            symbolizerObj.graphicOpacity = opacity ? opacity.toString() :
                BasiGX.util.SLD.DEFAULT_GRAPHIC_OPACITY.toString();
            symbolizerObj.graphicRotation = rotation ? rotation.toString() :
                BasiGX.util.SLD.DEFAULT_GRAPHIC_ROTATION.toString();
        }

        if (this.getMode() === 'point') {
            sldObj = BasiGX.util.SLD.setPointSymbolizerInRule(
                symbolizerObj,
                me.getRuleName(),
                sldObj
            );
        } else if (this.getMode() === 'line') {
            sldObj = BasiGX.util.SLD.setLineSymbolizerInRule(
                symbolizerObj,
                me.getRuleName(),
                sldObj
            );
        } else if (this.getMode() === 'polygon') {
            sldObj = BasiGX.util.SLD.setPolygonSymbolizerInRule(
                symbolizerObj,
                me.getRuleName(),
                sldObj
            );
        }

        var sld = BasiGX.util.SLD.toSldString(sldObj);

        // update our properties
        me.setSld(sld);
        me.setRule(BasiGX.util.SLD.getRuleByName(me.getRuleName(), sldObj));
        me.setSldObj(sldObj);

        return sld;

    },

    /**
     * Creates and shows a window with a `BasiGX.view.panel.FontSymbolPool`,
     * that allows the user to pick a font and symbol for setting a ttf mark
     * in the sld
     */
    onChooseFontClick: function() {
        var me = this;
        var callbackFn = function(fullQualifiedGlyphName) {
            var graphicFs = me.down('[name=graphic]');
            graphicFs.fontAndUniCode = fullQualifiedGlyphName;
            // unset an potential external graphic
            graphicFs.externalGraphicSrc = null;
            // set matching style options
            if (me.getMode() === 'point') {
                graphicFs.down('[name=graphic-opacity]').setDisabled(true);
            }
            if (me.getMode() === 'polygon') {
                graphicFs.down('[name=graphic-rotation]').setDisabled(false);
            }
            graphicFs.down('[name=fill]').setDisabled(false);
            graphicFs.down('[name=stroke]').setDisabled(false);
            graphicFs.down('[name=stroke-width]').setDisabled(false);
            graphicFs.down('[name=stroke-width]').setValue(1);
            me.updateSLDPreview();
        };

        // cleanup
        var selector = 'window[title=' +
            me.getViewModel().get('fontSymbolPoolWindowTitle') + ']';
        var wins = Ext.ComponentQuery.query(selector);
        Ext.each(wins, function(win) {
            win.destroy();
        });

        var fontSymbolPool = Ext.create('BasiGX.view.panel.FontSymbolPool', {
            geoserverFontListUrl: me.getBackendUrls().geoserverFontListUrl,
            geoserverFontUrl: me.getBackendUrls().geoserverFontUrl,
            useCsrfToken: true,
            onGlyphSelected: callbackFn
        });

        var fontSymbolPoolWin = Ext.create('Ext.window.Window', {
            title: me.getViewModel().get('fontSymbolPoolWindowTitle'),
            constrain: true,
            items: [fontSymbolPool]
        });
        fontSymbolPoolWin.showAt(5, 5);
    },

    /**
     * Creates and shows a window with a `BasiGX.view.panel.GraphicPool`, that
     * will eventually update both the preview and also the styles in the
     * attached layer.
     */
    onChooseGraphicClick: function() {
        var me = this;
        var okClickCallbackFn = function(pictureRec) {
            var pictureUrl = BasiGX.util.Url.getWebProjectBaseUrl() +
                me.getBackendUrls().pictureSrc.url +
                pictureRec.get('id');
            var graphicFs = me.down('[name=graphic]');
            graphicFs.externalGraphicSrc = pictureUrl;
            // unset an potential font and glyph
            graphicFs.fontAndUniCode = null;
            // set matching style options
            if (me.getMode() === 'point') {
                graphicFs.down('[name=graphic-opacity]').setDisabled(false);
            }
            if (me.getMode() === 'polygon') {
                graphicFs.down('[name=graphic-rotation]').setDisabled(true);
            }
            graphicFs.down('[name=fill]').setDisabled(true);
            graphicFs.down('[name=stroke]').setDisabled(true);
            graphicFs.down('[name=stroke-width]').setDisabled(true);
            me.updateSLDPreview();
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
            constrain: true,
            items: [graphicPool]
        });
        graphicPoolWin.show();
    }
});
