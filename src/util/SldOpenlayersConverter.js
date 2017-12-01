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
 * Utility class containing static methods for working with SLD.
 *
 * @class BasiGX.util.SldOpenlayersConverter
 */
Ext.define('BasiGX.util.SldOpenlayersConverter', {
    statics: {
        jsonixContext: null,
        marshaller: null,
        unmarshaller: null,
        neededGlobals: [
            'Jsonix',
            'SLD_1_0_0',
            'Filter_1_0_0',
            'GML_2_1_2',
            'XLink_1_0'
        ],
        DEFAULT_STROKE_OPACITY: 1,
        DEFAULT_STROKE_COLOR: '#000000',
        DEFAULT_STROKE_WIDTH: 0,

        DEFAULT_FILL_OPACITY: 1,

        /**
         *
         */
        setStaticJsonixReferences: function() {
            var staticMe = BasiGX.util.SldOpenlayersConverter;
            var foundCnt = 0;
            Ext.each(staticMe.neededGlobals, function(needed) {
                if (needed in window) {
                    foundCnt += 1;
                } else {
                    Ext.log.error(
                        'Required global variable \'' + needed + '\'' +
                        ' not found. Are Jsonix needed mappings loaded?'
                    );
                }
            });
            if (foundCnt !== staticMe.neededGlobals.length) {
                var msg = 'This function is not functional as its' +
                    ' requirements weren\'t met.';
                staticMe.toSldObject = function() {
                    Ext.log.error(msg);
                };
                staticMe.toSldObject = function() {
                    Ext.log.error(msg);
                };
                return;
            }
            // create the objects…
            var context = new Jsonix.Context([
                SLD_1_0_0, Filter_1_0_0, GML_2_1_2, XLink_1_0
            ], {
                namespacePrefixes: {
                    'http://www.opengis.net/sld': 'sld',
                    'http://www.opengis.net/ogc': 'ogc',
                    'http://www.opengis.net/gml': 'gml',
                    'http://www.w3.org/2001/XMLSchema-instance': 'xsi',
                    'http://www.w3.org/1999/xlink': 'xlink'
                }
            });
            var marshaller = context.createMarshaller();
            var unmarshaller = context.createUnmarshaller();
            // … and store them in the static variables.
            staticMe.jsonixContext = context;
            staticMe.marshaller = marshaller;
            staticMe.unmarshaller = unmarshaller;
        },

        /**
         * @param {Object} sldObj The SLD object.
         * @return {String} The name of the SLD.
         */
        getSldNameFromSld: function(sldObj) {
            return sldObj.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].name;
        },

        /**
         * @param {String} sldStr The SLD string.
         * @return {Object} The SLD object.
         */
        toSldObject: function(sldStr) {
            try {
                var util = BasiGX.util.SldOpenlayersConverter;
                return util.unmarshaller.unmarshalString(
                    sldStr
                );
            } catch (e) {
                return null;
            }
        },

        /**
         * @param {Object} sldObject The SLD object.
         * @return {String} The SLD string.
         */
        toSldString: function(sldObject) {
            if (sldObject.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].isDefault) {
                delete sldObject.value.namedLayerOrUserLayer[0]
                    .namedStyleOrUserStyle[0].isDefault;
            }
            var util = BasiGX.util.SldOpenlayersConverter;
            return util.marshaller.marshalString(sldObject);
        },

        /**
         * @param {String} sldString The SLD string.
         * @return {String} The type of the geometry.
         */
        guessGeometryTypeFromSldString: function(sldString) {
            if (sldString.indexOf('PointSymbolizer') > 0) {
                return 'Point';
            }
            if (sldString.indexOf('PolygonSymbolizer') > 0) {
                return 'Polygon';
            }
            if (sldString.indexOf('LineSymbolizer') > 0) {
                return 'Line';
            }
        },

        /**
         * @param {Object} sldObject The SLD object.
         * @return {Array} The Array of rules.
         */
        rulesFromSldObject: function(sldObject) {

            var firstNamedLayerOrUserLayer;

            if (sldObject && sldObject.value &&
                sldObject.value.namedLayerOrUserLayer &&
                sldObject.value.namedLayerOrUserLayer[0]) {
                firstNamedLayerOrUserLayer =
                    sldObject.value.namedLayerOrUserLayer[0];
                if (firstNamedLayerOrUserLayer.namedStyleOrUserStyle &&
                  firstNamedLayerOrUserLayer.namedStyleOrUserStyle[0] &&
                  firstNamedLayerOrUserLayer.namedStyleOrUserStyle[0]
                      .featureTypeStyle &&
                  firstNamedLayerOrUserLayer.namedStyleOrUserStyle[0]
                      .featureTypeStyle[0] &&
                  firstNamedLayerOrUserLayer.namedStyleOrUserStyle[0]
                      .featureTypeStyle[0].rule) {
                    return firstNamedLayerOrUserLayer.namedStyleOrUserStyle[0]
                        .featureTypeStyle[0].rule;
                }
            }

            return {};
        },

        /**
         * @param {Object} sldObject The SLD object.
         * @param {Array} rules The rules orray.
         * @return {Object} The SLD Object.
         */
        setRulesOfSldObject: function(sldObject, rules) {
            sldObject.value.
                namedLayerOrUserLayer[0].
                namedStyleOrUserStyle[0].
                featureTypeStyle[0].
                rule = rules;
            return sldObject;
        },

        /**
         * @param {Object} filter The filter object.
         * @return {boolean} True if filter is logical.
         */
        isLogicalFilter: function(filter) {
            return 'logicOps' in filter;
        },

        /**
         * @param {Object} filter The filter object.
         * @return {boolean} True if filter is spatial.
         */
        isSpatialFilter: function(filter) {
            return 'spatialOps' in filter;
        },

        /**
         * @param {Object} filter The filter object.
         * @return {boolean} True if filter is comparable.
         */
        isComparisonFilter: function(filter) {
            return 'comparisonOps' in filter;
        },

        /**
         * @param {Object} filter The filter object.
         * @return {String} The property name.
         */
        getPropertyNameFromFilter: function(filter) {
            var operator = filter.comparisonOps.name.localPart;
            var propertyName;
            switch (operator) {
                case 'PropertyIsNull':
                    propertyName = filter.comparisonOps.value.propertyName
                        .content[0];
                    break;
                case 'PropertyIsLike':
                    propertyName = filter.comparisonOps.value.propertyName
                        .content[0];
                    break;
                case 'PropertyIsBetween':
                    propertyName = filter.comparisonOps.value.expression.value
                        .content[0];
                    break;
                default:
                    propertyName = filter.comparisonOps.value.expression[0]
                        .value.content[0];
                    break;
            }
            return propertyName;
        },

        /**
         * @param {Object} filter The filter object.
         * @return {Array} The lieteral values array.
         */
        getLiteralValuesFromFilter: function(filter) {
            var operator = filter.comparisonOps.name.localPart;
            var literalValues = [];
            switch (operator) {
                case 'PropertyIsNull':
                    literalValues = null;
                    break;
                case 'PropertyIsLike':
                    literalValues.push(
                        filter.comparisonOps.value.literal.content[0]);
                    break;
                case 'PropertyIsBetween':
                    literalValues.push(filter.comparisonOps.value.lowerBoundary
                        .expression.value.content[0]);
                    literalValues.push(filter.comparisonOps.value.upperBoundary
                        .expression.value.content[0]);
                    break;
                default:
                    literalValues.push(filter.comparisonOps.value
                        .expression[1].value.content[0]);
                    break;
            }
            return literalValues;
        },

        /**
         * @param {Array} symbolizers The symbolizers array.
         * @return {Array} The style array.
         */
        styleFromSymbolizers: function(symbolizers) {
            var sldUtil = BasiGX.util.SldOpenlayersConverter;
            if (!Ext.isArray(symbolizers)) {
                symbolizers = [symbolizers];
            }

            var styleArr = [];

            Ext.each(symbolizers, function(symbolizer) {
                styleArr.push(sldUtil.styleFromSymbolizer(symbolizer));
            });

            return styleArr;
        },

        /**
         * @param {Object} symbolizer The symbolizer object.
         * @return {Object} The style object.
         */
        styleFromSymbolizer: function(symbolizer) {
            var sldUtil = BasiGX.util.SldOpenlayersConverter;
            var symbolType = sldUtil.symbolTypeFromSymbolizer(symbolizer);

            var style;
            switch (symbolType) {
                case 'Point':
                    style = sldUtil.pointStyleFromSymbolizer(symbolizer);
                    break;
                case 'Line':
                    style = sldUtil.lineStyleFromSymbolizer(symbolizer);
                    break;
                case 'Polygon':
                    style = sldUtil.polygonStyleFromSymbolizer(symbolizer);
                    break;
                case 'Text':
                    style = sldUtil.textStyleFromSymbolizer(symbolizer);
                    break;
                case 'Raster':
                    // IDK…
                    Ext.log.warn('Unimplemented symbolType \'Raster\'');
                    break;
                default:
                    Ext.log.warn(
                        'Unexpected symbolType \'' + symbolType + '\''
                    );
            }
            return style;
        },

        /**
         * @param {Array} cssParameters The cssParameters array.
         * @param {String} name The name.
         * @return {String} The content.
         */
        getFirstCssParameterContentByName: function(cssParameters, name) {
            var content;
            Ext.each(cssParameters, function(cssParameter) {
                if (cssParameter.name === name) {
                    content = cssParameter.content[0];
                    return false; // … and stop iteration
                }
            });
            return content;
        },

        /**
         * @param {Object} mark The mark object.
         * @return {Object} The fill object.
         */
        fillFromObj: function(mark) {
            var sldUtil = BasiGX.util.SldOpenlayersConverter;
            var fill;
            if ('fill' in mark) {
                // find the correct cssParameter
                var fillColor = sldUtil.getFirstCssParameterContentByName(
                    mark.fill.cssParameter, 'fill'
                );
                var fillOpacity = sldUtil.getFirstCssParameterContentByName(
                    mark.fill.cssParameter, 'fill-opacity'
                ) || sldUtil.DEFAULT_FILL_OPACITY;

                fillColor = BasiGX.util.Color.hexToRgba(fillColor, fillOpacity);
                fill = new ol.style.Fill({
                    color: fillColor
                });
            }
            return fill;
        },

        /**
         * @param {Object} mark The mark Object.
         * @return {Object} The stroke object.
         */
        strokeFromObj: function(mark) {
            var sldUtil = BasiGX.util.SldOpenlayersConverter;
            var stroke;
            if ('stroke' in mark) {
                var strokeColor = sldUtil.getFirstCssParameterContentByName(
                    mark.stroke.cssParameter, 'stroke'
                ) || sldUtil.DEFAULT_STROKE_COLOR;
                var strokeWidth = sldUtil.getFirstCssParameterContentByName(
                    mark.stroke.cssParameter, 'stroke-width'
                ) || sldUtil.DEFAULT_STROKE_WIDTH;
                var strokeOpacity = sldUtil.getFirstCssParameterContentByName(
                    mark.stroke.cssParameter, 'stroke-opacity'
                ) || sldUtil.DEFAULT_STROKE_OPACITY;

                strokeColor = BasiGX.util.Color.hexToRgba(strokeColor,
                    strokeOpacity);
                stroke = new ol.style.Stroke({
                    color: strokeColor,
                    width: strokeWidth
                    // TODO there are more… lineCap, lineJoin, lineDash,
                    //      miterLimit, they'll all have an SLD equivalent
                });
            }
            return stroke;
        },

        /**
         * @param {Object} symbolizer The symbolizer Object.
         * @return {Object} The style object.
         */
        pointStyleFromSymbolizer: function(symbolizer) {
            // ol.style.Style with image either ol.style.Circle or
            // ol.style.Icon, or basically also ol.style.RegularShape,
            // for wkts
            var sldUtil = BasiGX.util.SldOpenlayersConverter;
            var graphic = symbolizer.value.graphic;
            var size = parseFloat(graphic.size.content, 10);
            var firstGraphicOrMark = graphic.externalGraphicOrMark[0];
            var firstTypeName = firstGraphicOrMark.TYPE_NAME;
            var style;
            var wellKnownName;
            if ((/Mark/).test(firstTypeName)) {
                // … ol.style.Circle or ol.style.RegularShape
                if (firstGraphicOrMark.wellKnownName) {
                    wellKnownName = firstGraphicOrMark.wellKnownName.content[0];
                }
                var fill = sldUtil.fillFromObj(firstGraphicOrMark);
                var stroke = sldUtil.strokeFromObj(firstGraphicOrMark);

                switch (wellKnownName) {
                    case 'circle':
                        style = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: size,
                                fill: fill,
                                stroke: stroke
                            })
                        });
                        break;
                    case 'square':
                        style = new ol.style.Style({
                            image: new ol.style.RegularShape({
                                fill: fill,
                                stroke: stroke,
                                points: 4,
                                radius: size,
                                angle: Math.PI / 4
                            })
                        });
                        break;
                    case 'triangle':
                        style = new ol.style.Style({
                            image: new ol.style.RegularShape({
                                fill: fill,
                                stroke: stroke,
                                points: 3,
                                radius: size,
                                rotation: Math.PI / 4,
                                angle: 0
                            })
                        });
                        break;
                    case 'star':
                        style = new ol.style.Style({
                            image: new ol.style.RegularShape({
                                fill: fill,
                                stroke: stroke,
                                points: 5,
                                radius: size,
                                radius2: size / 2,
                                angle: 0
                            })
                        });
                        break;
                    case 'cross':
                        style = new ol.style.Style({
                            image: new ol.style.RegularShape({
                                fill: fill,
                                stroke: stroke,
                                points: 4,
                                radius: size,
                                radius2: size / 2,
                                angle: 0
                            })
                        });
                        break;
                    case 'x':
                        style = new ol.style.Style({
                            image: new ol.style.RegularShape({
                                fill: fill,
                                stroke: stroke,
                                points: 4,
                                radius: size,
                                radius2: size / 2,
                                angle: Math.PI / 4
                            })
                        });
                        break;
                    default:
                        style = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 10,
                                fill: new ol.style.Fill({
                                    color: '#3399CC'
                                }),
                                stroke: new ol.style.Stroke({
                                    color: '#FFFFFF',
                                    width: 1.25
                                })
                            })
                        });
                        break;
                }
            } else if ((/Graphic/).test(firstTypeName)) {
                // … ol.style.Icon
                var imageSrc = sldUtil.onlineResourceFromGraphic(
                    firstGraphicOrMark
                );
                style = new ol.style.Style({
                    image: new ol.style.Icon({
                        src: imageSrc,
                        // SLD size applies to height only if the image is
                        // rectangular, we'll fix this at the call site with
                        // a listener.
                        size: [size, size]
                    })
                });
            }

            return style;
        },

        /**
         * @param {Object} graphic The graphic Object.
         * @return {String} The URL string.
         */
        onlineResourceFromGraphic: function(graphic) {
            var url;
            if ((/ExternalGraphic$/).test(graphic.TYPE_NAME)) {
                url = graphic.onlineResource.href;
            }
            return url;
        },

        /**
         * @param {Object} symbolizer The symbolizer Object.
         * @return {Object} The style object.
         */
        lineStyleFromSymbolizer: function(symbolizer) {
            var sldUtil = BasiGX.util.SldOpenlayersConverter;
            var symbValue = symbolizer.value;
            var stroke = sldUtil.strokeFromObj(symbValue);
            return new ol.style.Style({
                stroke: stroke
            });
        },

        /**
         * @param {Object} symbolizer The symbolizer Object.
         * @return {Object} The style object.
         */
        polygonStyleFromSymbolizer: function(symbolizer) {
            var sldUtil = BasiGX.util.SldOpenlayersConverter;
            var symbValue = symbolizer.value;
            var fill = sldUtil.fillFromObj(symbValue);
            var stroke = sldUtil.strokeFromObj(symbValue);
            return new ol.style.Style({
                stroke: stroke,
                fill: fill
            });
        },

        /**
         *
         */
        textStyleFromSymbolizer: function() {
            Ext.log.warn('#textStyleFromSymbolizer: Not implemented yet');
        },

        /**
         * returns 'Point', 'Line', 'Polygon', 'Text' or 'Raster'
         * @param {Array} symbolizers The symbolizers Array.
         * @return {String} The geometry type.
         */
        symbolTypeFromSymbolizer: function(symbolizers) {
            var symbolType;
            if (!Ext.isArray(symbolizers)) {
                symbolizers = [symbolizers];
            }
            // the first symbolizer shall determine the type of symbol:
            if (symbolizers.length >= 1) {
                var first = symbolizers[0];
                var localPart = Ext.String.trim(first.name.localPart);
                // These are the possibilities:
                // * PointSymbolizer
                // * LineSymbolizer
                // * PolygonSymbolizer
                // * TextSymbolizer
                // * RasterSymbolizer
                symbolType = localPart.replace(/Symbolizer$/, '');
            }
            return symbolType;
        },

        /**
         * @param {Object} olSymbolizer The olSymbolizer Object.
         * @return {Object} The SLD object.
         */
        olSymbolizerToSldSymbolizer: function(olSymbolizer) {
            // has an image so it is a point style
            if (olSymbolizer.getImage()) {
                return this.pointSymbolizerToSld(olSymbolizer);
            }
            // has no image but a fill so it is a polygon style
            if (olSymbolizer.getFill()) {
                return this.polygonSymbolizerToSld(olSymbolizer);

            }
            // has no image but a fill so it is a polygon style
            if (olSymbolizer.getStroke()) {
                return this.lineSymbolizerToSld(olSymbolizer);
            }
        },

        /**
         * @param {Object} olSymbolizer The olSymbolizer Object.
         * @return {Object} The SLD object.
         */
        pointSymbolizerToSld: function(olSymbolizer) {
            var sldSymbolizer = {
                name: {
                    namespaceURI: 'http://www.opengis.net/sld',
                    localPart: 'PointSymbolizer',
                    prefix: 'sld',
                    key: '{http://www.opengis.net/sld}PointSymbolizer',
                    string: '{http://www.opengis.net/sld}sld:PointSymbolizer',
                    CLASS_NAME: 'Jsonix.XML.QName'
                },
                value: {
                    TYPE_NAME: 'SLD_1_0_0.PointSymbolizer',
                    graphic: {
                        TYPE_NAME: 'SLD_1_0_0.Graphic'
                    }
                }
            };
            if (olSymbolizer.getImage() instanceof ol.style.Circle) {
                var fillColor = BasiGX.util.Color.rgbaToHex(
                    olSymbolizer.getImage().getFill().getColor());
                var fillOpacity = BasiGX.util.Color.rgbaAsArray(
                    olSymbolizer.getImage().getFill().getColor())[4];
                var radius = olSymbolizer.getImage().getRadius().toString();
                var strokeColor = BasiGX.util.Color.rgbaToHex(
                    olSymbolizer.getImage().getStroke().getColor());
                var strokeWidth = olSymbolizer.getImage().getStroke()
                    .getWidth().toString();
                var strokeOpacity = BasiGX.util.Color.rgbaAsArray(
                    olSymbolizer.getImage().getStroke().getColor())[4];

                sldSymbolizer.value.graphic.externalGraphicOrMark = [{
                    TYPE_NAME: 'SLD_1_0_0.Mark',
                    wellKnownName: {
                        TYPE_NAME: 'SLD_1_0_0.WellKnownName',
                        content: ['circle']
                    },
                    fill: {
                        TYPE_NAME: 'SLD_1_0_0.Fill',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'fill',
                            content: [fillColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'fill-opacity',
                            content: [fillOpacity]
                        }]
                    },
                    stroke: {
                        TYPE_NAME: 'SLD_1_0_0.Stroke',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke',
                            content: [strokeColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-width',
                            content: [strokeWidth]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-opacity',
                            content: [strokeOpacity]
                        }]
                    }
                }];
                sldSymbolizer.value.graphic.size = {
                    TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                    content: [radius]
                };
            }
            if (olSymbolizer.getImage() instanceof ol.style.Icon) {
                var size = olSymbolizer.getImage().getSize()[1].toString();
                var src = olSymbolizer.getImage().getSrc();
                sldSymbolizer.value.graphic.externalGraphicOrMark = [{
                    TYPE_NAME: 'SLD_1_0_0.ExternalGraphic',
                    onlineResource: {
                        TYPE_NAME: 'SLD_1_0_0.OnlineResource',
                        type: 'simple',
                        href: src
                    },
                    format: 'image/png'
                }];
                sldSymbolizer.value.graphic.size = {
                    TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                    content: [size]
                };
            }
            return sldSymbolizer;
        },

        /**
         * @param {Object} olSymbolizer The olSymbolizer Object.
         * @return {Object} The SLD object.
         */
        polygonSymbolizerToSld: function(olSymbolizer) {
            var fillColor = BasiGX.util.Color.rgbaToHex(
                olSymbolizer.getFill().getColor());
            var fillOpacity = BasiGX.util.Color.rgbaAsArray(
                olSymbolizer.getFill().getColor())[4];
            var strokeColor = BasiGX.util.Color.rgbaToHex(
                olSymbolizer.getStroke().getColor());
            var strokeWidth = olSymbolizer.getStroke()
                .getWidth().toString();
            var strokeOpacity = BasiGX.util.Color.rgbaAsArray(
                olSymbolizer.getStroke().getColor())[4];

            var sldSymbolizer = {
                name: {
                    namespaceURI: 'http://www.opengis.net/sld',
                    localPart: 'PolygonSymbolizer',
                    prefix: 'sld',
                    key: '{http://www.opengis.net/sld}PolygonSymbolizer',
                    string: '{http://www.opengis.net/sld}sld:PolygonSymbolizer',
                    CLASS_NAME: 'Jsonix.XML.QName'
                },
                value: {
                    TYPE_NAME: 'SLD_1_0_0.PolygonSymbolizer',
                    fill: {
                        TYPE_NAME: 'SLD_1_0_0.Fill',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'fill',
                            content: [fillColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'fill-opacity',
                            content: [fillOpacity]
                        }]
                    },
                    stroke: {
                        TYPE_NAME: 'SLD_1_0_0.Stroke',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke',
                            content: [strokeColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-width',
                            content: [strokeWidth]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-opacity',
                            content: [strokeOpacity]
                        }]
                    }
                }
            };
            return sldSymbolizer;
        },

        /**
         * @param {Object} olSymbolizer The olSymbolizer Object.
         * @return {Object} The SLD object.
         */
        lineSymbolizerToSld: function(olSymbolizer) {
            var strokeColor = BasiGX.util.Color.rgbaToHex(
                olSymbolizer.getStroke().getColor());
            var strokeWidth = olSymbolizer.getStroke()
                .getWidth().toString();
            var strokeOpacity = BasiGX.util.Color.rgbaAsArray(
                olSymbolizer.getStroke().getColor())[4];

            var sldSymbolizer = {
                name: {
                    namespaceURI: 'http://www.opengis.net/sld',
                    localPart: 'LineSymbolizer',
                    prefix: 'sld',
                    key: '{http://www.opengis.net/sld}LineSymbolizer',
                    string: '{http://www.opengis.net/sld}sld:LineSymbolizer',
                    CLASS_NAME: 'Jsonix.XML.QName'
                },
                value: {
                    TYPE_NAME: 'SLD_1_0_0.LineSymbolizer',
                    stroke: {
                        TYPE_NAME: 'SLD_1_0_0.Stroke',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke',
                            content: [strokeColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-width',
                            content: [strokeWidth]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-opacity',
                            content: [strokeOpacity]
                        }]
                    }
                }
            };
            return sldSymbolizer;
        },

        /**
         * @param {Object} filterValues The filterValues Object.
         * @return {Object} The SLD filter.
         */
        filterValuesToSldFilter: function(filterValues) {
            var sldFilter = {
                TYPE_NAME: 'Filter_1_0_0.FilterType',
                comparisonOps: {
                    name: {
                        namespaceURI: 'http://www.opengis.net/ogc',
                        localPart: filterValues.operatorCombo,
                        prefix: 'ogc',
                        key: '{http://www.opengis.net/ogc}' +
                                filterValues.operatorCombo,
                        string: '{http://www.opengis.net/ogc}ogc:' +
                                filterValues.operatorCombo,
                        CLASS_NAME: 'Jsonix.XML.QName'
                    },
                    value: {
                        TYPE_NAME: 'Filter_1_0_0.BinaryComparisonOpType',
                        expression: [{
                            name: {
                                namespaceURI: 'http://www.opengis.net/ogc',
                                localPart: 'PropertyName',
                                prefix: 'ogc',
                                key: '{http://www.opengis.net/ogc}PropertyName',
                                string: '{http://www.opengis.net/ogc}' +
                                        'ogc:PropertyName',
                                CLASS_NAME: 'Jsonix.XML.QName'
                            },
                            value: {
                                TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                                content: [filterValues.attributeCombo]
                            }
                        }, {
                            name: {
                                namespaceURI: 'http://www.opengis.net/ogc',
                                localPart: 'Literal',
                                prefix: 'ogc',
                                key: '{http://www.opengis.net/ogc}Literal',
                                string: '{http://www.opengis.net/ogc}' +
                                        'ogc:Literal',
                                CLASS_NAME: 'Jsonix.XML.QName'
                            },
                            value: {
                                TYPE_NAME: 'Filter_1_0_0.LiteralType',
                                content: [filterValues.literalTextField]
                            }
                        }]
                    }
                }
            };

            switch (filterValues.operatorCombo) {
                case 'PropertyIsEqualTo':
                    break;
                case 'PropertyIsNotEqualTo':
                    break;
                case 'PropertyIsBetween':
                    sldFilter.comparisonOps.value = {
                        TYPE_NAME: 'Filter_1_0_0.PropertyIsBetweenType',
                        expression: {
                            name: {
                                namespaceURI: 'http://www.opengis.net/ogc',
                                localPart: 'PropertyName',
                                prefix: 'ogc',
                                key: '{http://www.opengis.net/ogc}PropertyName',
                                string: '{http://www.opengis.net/ogc}' +
                                        'ogc:PropertyName',
                                CLASS_NAME: 'Jsonix.XML.QName'
                            },
                            value: {
                                TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                                content: [filterValues.attributeCombo]
                            }
                        },
                        lowerBoundary: {
                            TYPE_NAME: 'Filter_1_0_0.LowerBoundaryType',
                            expression: {
                                name: {
                                    namespaceURI: 'http://www.opengis.net/ogc',
                                    localPart: 'Literal',
                                    prefix: 'ogc',
                                    key: '{http://www.opengis.net/ogc}Literal',
                                    string: '{http://www.opengis.net/ogc}' +
                                            'ogc:Literal',
                                    CLASS_NAME: 'Jsonix.XML.QName'
                                },
                                value: {
                                    TYPE_NAME: 'Filter_1_0_0.LiteralType',
                                    content: [filterValues.literalNumberField1
                                        .toString()]
                                }
                            }
                        },
                        upperBoundary: {
                            TYPE_NAME: 'Filter_1_0_0.UpperBoundaryType',
                            expression: {
                                name: {
                                    namespaceURI: 'http://www.opengis.net/ogc',
                                    localPart: 'Literal',
                                    prefix: 'ogc',
                                    key: '{http://www.opengis.net/ogc}Literal',
                                    string: '{http://www.opengis.net/ogc}' +
                                            'ogc:Literal',
                                    CLASS_NAME: 'Jsonix.XML.QName'
                                },
                                value: {
                                    TYPE_NAME: 'Filter_1_0_0.LiteralType',
                                    content: [filterValues.literalNumberField2
                                        .toString()]
                                }
                            }
                        }
                    };
                    break;
                case 'PropertyIsLike':
                    sldFilter.comparisonOps.value = {
                        TYPE_NAME: 'Filter_1_0_0.PropertyIsLikeType',
                        wildCard: '*',
                        singleChar: '%',
                        escape: '!',
                        propertyName: {
                            TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                            content: [filterValues.attributeCombo]
                        },
                        literal: {
                            TYPE_NAME: 'Filter_1_0_0.LiteralType',
                            content: [filterValues.literalTextField]
                        }
                    };
                    break;
                case 'PropertyIsNull':
                    sldFilter.comparisonOps.value = {
                        TYPE_NAME: 'Filter_1_0_0.PropertyIsNullType',
                        propertyName: {
                            TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                            content: ['fid']
                        }
                    };
                    break;
                case 'PropertyIsLessThan':
                case 'PropertyIsLessThanOrEqualTo':
                case 'PropertyIsGreaterThan':
                case 'PropertyIsGreaterThanOrEqualTo':
                    sldFilter.comparisonOps.value.expression[1] = {
                        name: {
                            namespaceURI: 'http://www.opengis.net/ogc',
                            localPart: 'Literal',
                            prefix: 'ogc',
                            key: '{http://www.opengis.net/ogc}Literal',
                            string: '{http://www.opengis.net/ogc}ogc:Literal',
                            CLASS_NAME: 'Jsonix.XML.QName'
                        },
                        value: {
                            TYPE_NAME: 'Filter_1_0_0.LiteralType',
                            content: [filterValues
                                .literalNumberField2.toString()]
                        }
                    };
                    break;
                default:
                    break;
            }
            return sldFilter;
        },

        /**
         * credits to
         * https://stackoverflow.com/questions/376373/pretty-printing-xml-with-
         * javascript
         *
         * @param {String} xml The xml String.
         * @return {String} The formatted SLD string.
         */
        prettifySld: function(xml) {
            var formatted = '';
            var reg = /(>)(<)(\/*)/g;
            xml = xml.replace(reg, '$1\r\n$2$3');
            var pad = 0;
            Ext.each(xml.split('\r\n'), function(node) {
                var indent = 0;
                if (node.match(/.+<\/\w[^>]*>$/)) {
                    indent = 0;
                } else if (node.match(/^<\/\w/)) {
                    if (pad !== 0) {
                        pad -= 1;
                    }
                } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                    indent = 1;
                } else {
                    indent = 0;
                }

                var padding = '';
                for (var i = 0; i < pad; i++) {
                    padding += '    ';
                }

                formatted += padding + node + '\r\n';
                pad += indent;
            });
            return formatted;
        },

        /**
         * @param {String} sld The sld String.
         * @return {boolean} True if the SLD is valid.
         */
        validateSldString: function(sld) {
            var valid = BasiGX.util.SldOpenlayersConverter.toSldObject(sld);
            if (valid !== null) {
                return true;
            } else {
                return false;
            }
        }

    }
}, function() {
    BasiGX.util.SldOpenlayersConverter.setStaticJsonixReferences();
});
