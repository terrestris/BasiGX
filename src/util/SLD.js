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
 * SLD Util
 *
 * Some methods to convert javascript objects into SLD and vice versa
 *
 * @class BasiGX.util.SLD
 * @author Johannes Weskamm
 * @author Marc Jansen
 * @author Kai Volland
 */
Ext.define('BasiGX.util.SLD', {
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
        DEFAULT_STROKE_OPACITY: '1',
        DEFAULT_STROKE_COLOR: '#000000',
        DEFAULT_STROKE_WIDTH: '0',

        DEFAULT_FILL_COLOR: '#FF0000',
        DEFAULT_FILL_OPACITY: '1',

        DEFAULT_POINT_RADIUS: '5',
        DEFAULT_GRAPHIC_SIZE: '50',
        DEFAULT_GRAPHIC_OPACITY: '1',
        DEFAULT_GRAPHIC_ROTATION: '0',

        /**
         * Method cares about the inital setup and checks if Jsonix is
         * configured correctly
         */
        setStaticJsonixReferences: function() {
            var staticMe = BasiGX.util.SLD;
            var foundCnt = 0;
            Ext.each(staticMe.neededGlobals, function(needed) {
                if (needed in window) {
                    foundCnt += 1;
                } else {
                    Ext.log.error('Required global variable "' + needed + '"' +
                    ' not found. Are Jsonix needed mappings loaded?');
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
         * Method used to convert a SLD string into a valid
         * (Jsonix)-javascript object
         *
         * @return {Object} sldObject The SLD object.
         * @param {String} sldStr The SLD string to transform.
         */
        toSldObject: function(sldStr) {
            try {
                return BasiGX.util.SLD.unmarshaller.unmarshalString(sldStr);
            } catch (e) {
                return null;
            }
        },

        /**
         * Method used to convert a (Jsonix)-javascript object into a valid
         * SLD string
         *
         * @return {String} sld The SLD string.
         * @param {Object} sldObject The SLD object to transform.
         */
        toSldString: function(sldObject) {
            if (sldObject.value.namedLayerOrUserLayer[0]
                    .namedStyleOrUserStyle[0].isDefault) {
                delete sldObject.value.namedLayerOrUserLayer[0]
                        .namedStyleOrUserStyle[0].isDefault;
            }
            return BasiGX.util.SLD.marshaller.marshalString(sldObject);
        },

        /**
         * Method gets the first available rules section
         * from a javascript SLD object
         *
         * @return {Array} rules The rule Array.
         * @param {Object} sldObject The SLD object to get the rules from.
         */
        rulesFromSldObject: function(sldObject) {
            return sldObject.value.
                namedLayerOrUserLayer[0].
                namedStyleOrUserStyle[0].
                featureTypeStyle[0].
                rule;
        },

        /**
         * Gets a rule Object by the given name and SLD Object
         *
         * @return {Object} rule The rule that was searched for.
         * @param {String} ruleName The name of the rule to search for.
         * @param {Object} sldObject The SLD object to search in.
         */
        getRuleByName: function(ruleName, sldObject) {
            var rules = BasiGX.util.SLD.rulesFromSldObject(sldObject);
            var rule;
            if (!rules) {
                return;
            }
            Ext.each(rules, function(currentRule) {
                if (currentRule.name === ruleName) {
                    rule = currentRule;
                    return false;
                }
            });
            return rule;
        },

        /**
         * Sets a rule Object by the given name and SLD Object.
         * If no exisiting match is found, the rule will be created and added
         *
         * @return {Object} sldObject The modified SLD Object
         * @param {String} ruleName The name of the rule to modify or create.
         * @param {Object} symbolizer An Object representing the SLD symbolizer.
         * @param {Object} sldObject The SLD object to modify.
         */
        setRuleByName: function(ruleName, symbolizer, sldObject) {
            var rules = BasiGX.util.SLD.rulesFromSldObject(sldObject);
            if (!rules) {
                rules = [];
            }
            var ruleMatchIdx;
            Ext.each(rules, function(currentRule, index) {
                if (currentRule.name === ruleName) {
                    ruleMatchIdx = index;
                    return false;
                }
            });
            if (!Ext.isNumeric(ruleMatchIdx)) {
                // create a new rule for the symbolizer
                var newRule = {
                    TYPE_NAME: 'SLD_1_0_0.Rule',
                    name: ruleName,
                    symbolizer: []
                };
                newRule.symbolizer.push(symbolizer);
                rules.push(newRule);
            } else {
                // override the exisiting symbolizer
                rules[ruleMatchIdx].symbolizer[0] = symbolizer;
            }
            return BasiGX.util.SLD.setRulesOfSldObject(sldObject, rules);
        },

        /**
         * Method sets the given rules in the first available rules section
         * in the given javascript SLD object
         *
         * @return {Object} sldObject The modified SLD Object
         * @param {Object} sldObject The SLD object to modify.
         * @param {Array} rules An Array of SLD rules.
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
         * Method converts a fill object in Jsonix syntax into a simplified
         * object
         *
         * @return {Object} fill The simplified fill object.
         * @param {Object} fillObj The fill object in Jsonix syntax.
         */
        fillFromObj: function(fillObj) {
            var sldUtil = BasiGX.util.SLD;
            var fill = {
                fillColor: sldUtil.DEFAULT_FILL_COLOR,
                fillOpacity: sldUtil.DEFAULT_FILL_OPACITY
            };
            var fillParams = fillObj.cssParameter;
            Ext.each(fillParams, function(param) {
                if (param.name === 'fill') {
                    fill.fillColor = param.content[0];
                }
                if (param.name === 'fill-opacity') {
                    fill.fillOpacity = param.content[0];
                }
            });
            return fill;
        },

        /**
         * Method converts a stroke object in Jsonix syntax into a simplified
         * object
         *
         * @return {Object} stroke The simplified stroke object.
         * @param {Object} strokeObj The stroke object in Jsonix syntax.
         */
        strokeFromObj: function(strokeObj) {
            var stroke = {
                strokeWidth: BasiGX.util.SLD.DEFAULT_STROKE_WIDTH,
                strokeOpacity: BasiGX.util.SLD.DEFAULT_STROKE_OPACITY,
                strokeColor: BasiGX.util.SLD.DEFAULT_STROKE_COLOR
            };
            var strokeParams = strokeObj.cssParameter;
            Ext.each(strokeParams, function(param) {
                if (param.name === 'stroke') {
                    stroke.strokeColor = param.content[0];
                }
                if (param.name === 'stroke-width') {
                    stroke.strokeWidth = param.content[0];
                }
                if (param.name === 'stroke-opacity') {
                    stroke.strokeOpacity = param.content[0];
                }
            });
            return stroke;
        },

        /**
         * Method updates the point symbolizer for a given rule and sldObject
         *
         * @return {Object} sldObject The updated SLD object.
         * @param {Object} symbolizerObj The simplified symbolizer object.
         * @param {String} ruleName The name of the rule that should be updated.
         * @param {Object} sldObj The sldObj to update, containing the rule.
         */
        setPointSymbolizerInRule: function(symbolizerObj, ruleName, sldObj) {
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

            sldSymbolizer.value.graphic.externalGraphicOrMark = [{
                TYPE_NAME: 'SLD_1_0_0.Mark',
                wellKnownName: {
                    TYPE_NAME: 'SLD_1_0_0.WellKnownName',
                    content: symbolizerObj.fontAndUniCode ?
                        [symbolizerObj.fontAndUniCode] : ['circle']
                },
                fill: {
                    TYPE_NAME: 'SLD_1_0_0.Fill',
                    cssParameter: [{
                        TYPE_NAME: 'SLD_1_0_0.CssParameter',
                        name: 'fill',
                        content: [symbolizerObj.fillColor]
                    }, {
                        TYPE_NAME: 'SLD_1_0_0.CssParameter',
                        name: 'fill-opacity',
                        content: [symbolizerObj.fillOpacity]
                    }]
                },
                stroke: {
                    TYPE_NAME: 'SLD_1_0_0.Stroke',
                    cssParameter: [{
                        TYPE_NAME: 'SLD_1_0_0.CssParameter',
                        name: 'stroke',
                        content: [symbolizerObj.strokeColor]
                    }, {
                        TYPE_NAME: 'SLD_1_0_0.CssParameter',
                        name: 'stroke-width',
                        content: [symbolizerObj.strokeWidth]
                    }, {
                        TYPE_NAME: 'SLD_1_0_0.CssParameter',
                        name: 'stroke-opacity',
                        content: [symbolizerObj.strokeOpacity]
                    }]
                }
            }];

            var size = symbolizerObj.radius || symbolizerObj.graphicSize ||
                BasiGX.util.SLD.DEFAULT_GRAPHIC_SIZE;
            var opacity = symbolizerObj.graphicOpacity || BasiGX.util.
                SLD.DEFAULT_GRAPHIC_OPACITY;
            var rotation = symbolizerObj.graphicRotation || BasiGX.util.
                SLD.DEFAULT_GRAPHIC_ROTATION;

            sldSymbolizer.value.graphic.size = {
                TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                content: [size]
            };
            sldSymbolizer.value.graphic.opacity = {
                TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                content: [opacity]
            };
            sldSymbolizer.value.graphic.rotation = {
                TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                content: [rotation]
            };

            if (symbolizerObj.externalGraphicSrc) {
                var src = symbolizerObj.externalGraphicSrc;
                sldSymbolizer.value.graphic.externalGraphicOrMark = [{
                    TYPE_NAME: 'SLD_1_0_0.ExternalGraphic',
                    onlineResource: {
                        TYPE_NAME: 'SLD_1_0_0.OnlineResource',
                        type: 'simple',
                        href: src
                    },
                    format: 'image/png'
                }];
            }
            sldObj = BasiGX.util.SLD.setRuleByName(
                ruleName,
                sldSymbolizer,
                sldObj
            );
            return sldObj;
        },

        /**
         * Method updates the line symbolizer for a given rule and sldObject
         *
         * @return {Object} sldObject The updated SLD object.
         * @param {Object} symbolizerObj The simplified symbolizer object.
         * @param {String} ruleName The name of the rule that should be updated.
         * @param {Object} sldObj The sldObj to update, containing the rule.
         */
        setLineSymbolizerInRule: function(symbolizerObj, ruleName, sldObj) {
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
                            content: [symbolizerObj.strokeColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-width',
                            content: [symbolizerObj.strokeWidth]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-opacity',
                            content: [symbolizerObj.strokeOpacity]
                        }]
                    }
                }
            };
            sldObj = BasiGX.util.SLD.setRuleByName(
                ruleName,
                sldSymbolizer,
                sldObj
            );
            return sldObj;
        },

        /**
         * Method updates the polygon symbolizer for a given rule and sldObject
         *
         * @return {Object} sldObject The updated SLD object.
         * @param {Object} symbolizerObj The simplified symbolizer object.
         * @param {String} ruleName The name of the rule that should be updated.
         * @param {Object} sldObj The sldObj to update, containing the rule.
         */
        setPolygonSymbolizerInRule: function(symbolizerObj, ruleName, sldObj) {
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
                            content: [symbolizerObj.fillColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'fill-opacity',
                            content: [symbolizerObj.fillOpacity]
                        }]
                    },
                    stroke: {
                        TYPE_NAME: 'SLD_1_0_0.Stroke',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke',
                            content: [symbolizerObj.strokeColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-width',
                            content: [symbolizerObj.strokeWidth]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'stroke-opacity',
                            content: [symbolizerObj.strokeOpacity]
                        }]
                    }
                }
            };
            if (symbolizerObj.externalGraphicSrc ||
                symbolizerObj.fontAndUniCode) {
                var size = symbolizerObj.graphicSize || BasiGX.util.
                    SLD.DEFAULT_GRAPHIC_SIZE;
                var opacity = symbolizerObj.graphicOpacity || BasiGX.util.
                    SLD.DEFAULT_GRAPHIC_OPACITY;
                var rotation = symbolizerObj.graphicRotation || BasiGX.util.
                    SLD.DEFAULT_GRAPHIC_ROTATION;
                sldSymbolizer.value.fill.graphicFill = {};
                sldSymbolizer.value.fill.graphicFill.graphic = {};

                if (symbolizerObj.externalGraphicSrc) {
                    sldSymbolizer.value.fill.graphicFill.graphic.
                    externalGraphicOrMark = [{
                        TYPE_NAME: 'SLD_1_0_0.ExternalGraphic',
                        onlineResource: {
                            TYPE_NAME: 'SLD_1_0_0.OnlineResource',
                            type: 'simple',
                            href: symbolizerObj.externalGraphicSrc
                        },
                        format: 'image/png'
                    }];
                } else if (symbolizerObj.fontAndUniCode) {
                    sldSymbolizer.value.fill.graphicFill.graphic.
                    externalGraphicOrMark = [{
                        TYPE_NAME: 'SLD_1_0_0.Mark',
                        wellKnownName: {
                            TYPE_NAME: 'SLD_1_0_0.WellKnownName',
                            content: [symbolizerObj.fontAndUniCode]
                        },
                        fill: {
                            TYPE_NAME: 'SLD_1_0_0.Fill',
                            cssParameter: [{
                                TYPE_NAME: 'SLD_1_0_0.CssParameter',
                                name: 'fill',
                                content: [symbolizerObj.fillColor]
                            }, {
                                TYPE_NAME: 'SLD_1_0_0.CssParameter',
                                name: 'fill-opacity',
                                content: [symbolizerObj.fillOpacity]
                            }]
                        },
                        stroke: {
                            TYPE_NAME: 'SLD_1_0_0.Stroke',
                            cssParameter: [{
                                TYPE_NAME: 'SLD_1_0_0.CssParameter',
                                name: 'stroke',
                                content: [symbolizerObj.strokeColor]
                            }, {
                                TYPE_NAME: 'SLD_1_0_0.CssParameter',
                                name: 'stroke-width',
                                content: [symbolizerObj.strokeWidth]
                            }, {
                                TYPE_NAME: 'SLD_1_0_0.CssParameter',
                                name: 'stroke-opacity',
                                content: [symbolizerObj.strokeOpacity]
                            }]
                        }
                    }];
                }

                sldSymbolizer.value.fill.graphicFill.graphic.size = {
                    TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                    content: [size]
                };
                sldSymbolizer.value.fill.graphicFill.graphic.opacity = {
                    TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                    content: [opacity]
                };
                sldSymbolizer.value.fill.graphicFill.graphic.rotation = {
                    TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                    content: [rotation]
                };
            }

            sldObj = BasiGX.util.SLD.setRuleByName(
                ruleName,
                sldSymbolizer,
                sldObj
            );
            return sldObj;
        }
    }
}, function() {
    BasiGX.util.SLD.setStaticJsonixReferences();
});
