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
    requires: [
        'Ext.String',
        'BasiGX.util.Jsonix',
        'BasiGX.util.Object'
    ],
    statics: {
        DEFAULT_STROKE_OPACITY: '1',
        DEFAULT_STROKE_COLOR: '#000000',
        DEFAULT_STROKE_WIDTH: '1',

        DEFAULT_FILL_COLOR: '#FF0000',
        DEFAULT_FILL_OPACITY: '1',

        DEFAULT_POINT_RADIUS: '5',
        DEFAULT_GRAPHIC_SIZE: '50',
        DEFAULT_GRAPHIC_OPACITY: '1',
        DEFAULT_GRAPHIC_ROTATION: '0',

        DEFAULT_FONTSIZE: '10',
        DEFAULT_FONT_FAMILY: 'DejaVu Sans',
        DEFAULT_FONT_WEIGHT: 'normal',
        DEFAULT_FONT_STYLE: 'normal',
        DEFAULT_FONT_FILLCOLOR: '#000000',
        DEFAULT_LABEL_ATTRIBUTE: 'name',
        DEFAULT_LABEL_PERPENDICULAROFFSET: '0',
        DEFAULT_LABEL_ANCHORPOINTX: '0',
        DEFAULT_LABEL_ANCHORPOINTY: '0',
        DEFAULT_LABEL_DISPLACEMENTX: '0',
        DEFAULT_LABEL_DISPLACEMENTY: '0',
        DEFAULT_LABEL_ROTATION: '0',
        DEFAULT_LABEL_FOLLOW_LINE: 'false',

        /**
         *
         */
        setStaticJsonixReferences: function() {
            // empty stub to obtain backwards compatability
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
                return BasiGX.util.Jsonix.unmarshaller.unmarshalString(sldStr);
            } catch (e) {
                Ext.log.warn('Could not unmarshal the SLD string!');
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
            return BasiGX.util.Jsonix.marshaller.marshalString(sldObject);
        },

        /**
         * Method gets the first available rules section
         * from a javascript SLD object
         *
         * @return {Array} rules The rule Array.
         * @param {Object} sldObject The SLD object to get the rules from.
         */
        rulesFromSldObject: function(sldObject) {
            return BasiGX.util.Object.getValue('rule', sldObject);
        },

        /**
         * Gets a rule Object by the given name and SLD Object.
         * As rule names are not unique, you may get an unexpected result as
         * this method returns the first match
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
         * If no exisiting match is found, the rule will be created and added.
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
                // override the exisiting symbolizer. If no matching symbolizer
                // to override is found, append the symbolizer
                var symbolizerIndex = rules[ruleMatchIdx].symbolizer.length;
                Ext.each(rules[ruleMatchIdx].symbolizer, function(s, idx) {
                    if (s.value.TYPE_NAME === symbolizer.value.TYPE_NAME) {
                        symbolizerIndex = idx;
                        return false;
                    }
                });
                rules[ruleMatchIdx].symbolizer[symbolizerIndex] = symbolizer;
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
            var ruleFromObject = BasiGX.util.Object.getValue('rule', sldObject);
            if (ruleFromObject) {
                ruleFromObject = rules;
            }
            return sldObject;
        },

        /**
         * Retrieves the SLD for the given URL and layer name
         * @param {String} wmsUrl The WMS URL to use
         * @param {String} layerName The name of the layer to get the SLD for
         * @param {requestCallback} successCb The callback for the success case
         * @param {requestCallback} errorCb The callback for the error case
         */
        getSldFromGeoserver: function(wmsUrl, layerName, successCb, errorCb) {
            if (!wmsUrl || !layerName || !successCb || !errorCb) {
                Ext.log.error('Invalid arguments for method ' +
                    '`getSldFromGeoserver`');
                errorCb.call();
                return;
            }
            var url = Ext.String.urlAppend(wmsUrl, 'request=GetStyles');
            url = Ext.String.urlAppend(url, 'layers=' + layerName);
            url = Ext.String.urlAppend(url, 'service=WMS');
            url = Ext.String.urlAppend(url, 'version=1.1.1');

            Ext.Ajax.request({
                url: url,
                success: successCb,
                failure: errorCb,
                timeout: 120000
            });
        },

        /**
         * Gets all configured SLD filters and converts it to
         * a SLD filter encoding object.
         *
         * @param {Array} rules Array containing all SLD rules
         * @return {String} Filter encoding for SLD filter.
         */
        getFilterEncodingFromSldRules: function(rules) {
            var filterContent;
            var sldFilterObj;
            var sldFilter = [];
            Ext.each(rules, function(rule) {
                filterContent = BasiGX.util.Object.getValue('filter', rule);
                if (filterContent) {
                    sldFilterObj = BasiGX.util.SLD
                        .filterContentToWholeSimpleFilter(
                            filterContent
                        );
                    sldFilter.push(
                        BasiGX.util.Jsonix.marshaller.marshalString(sldFilterObj)
                    );
                }
            });
            return sldFilter;
        },

        /**
         * This method will be used to create a whole filter encoding string
         * for given filter content by adding of `<ogc:Filter>` tag around of
         * filter itself.
         *
         * @param {Object} filterContent Jsonix conform filter content value
         *     object.
         * @return {Object} An object representing a simple OGC filter 1.0.0;
         *     ready to be stringified using Jsonix.
         */
        filterContentToWholeSimpleFilter: function(filterContent) {
            return {
                value: filterContent,
                name: {
                    namespaceURI: 'http://www.opengis.net/ogc',
                    localPart: 'Filter',
                    prefix: 'ogc',
                    key: '{http://www.opengis.net/ogc}Filter',
                    string: '{http://www.opengis.net/ogc}' +
                        'ogc:Filter'
                }
            };
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
         * Method removes the text symbolizer for a given rule and sldObject
         *
         * @return {Object} sldObject The updated SLD object.
         * @param {String} ruleName The name of the rule that should be updated.
         * @param {Object} sldObject The sldObj to update, containing the rule.
         */
        removeTextSymbolizerFromRule: function(ruleName, sldObject) {
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
            if (Ext.isNumeric(ruleMatchIdx)) {
                // remove the existing TextSymbolizer
                var symbolizerIndex;
                Ext.each(rules[ruleMatchIdx].symbolizer, function(s, idx) {
                    if (s.value.TYPE_NAME === 'SLD_1_0_0.TextSymbolizer') {
                        symbolizerIndex = idx;
                        return false;
                    }
                });
                if (Ext.isNumeric(symbolizerIndex)) {
                    rules[ruleMatchIdx].symbolizer.splice(symbolizerIndex, 1);
                }
            }
            return sldObject;
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
        },

        /**
         * Method updates the text symbolizer for a given rule and sldObject
         *
         * @return {Object} sldObject The updated SLD object.
         * @param {Object} symbolizerObj The simplified symbolizer object.
         * @param {String} ruleName The name of the rule that should be updated.
         * @param {Object} sldObj The sldObj to update, containing the rule.
         */
        setTextSymbolizerInRule: function(symbolizerObj, ruleName, sldObj) {
            var sldSymbolizer = {
                name: {
                    namespaceURI: 'http://www.opengis.net/sld',
                    localPart: 'TextSymbolizer',
                    prefix: 'sld',
                    key: '{http://www.opengis.net/sld}TextSymbolizer',
                    string: '{http://www.opengis.net/sld}sld:TextSymbolizer',
                    CLASS_NAME: 'Jsonix.XML.QName'
                },
                value: {
                    TYPE_NAME: 'SLD_1_0_0.TextSymbolizer',
                    fill: {
                        TYPE_NAME: 'SLD_1_0_0.Fill',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'fill',
                            content: [symbolizerObj.fontFillColor]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'fill-opacity',
                            content: [symbolizerObj.fontFillOpacity]
                        }]
                    },
                    font: {
                        TYPE_NAME: 'SLD_1_0_0.Font',
                        cssParameter: [{
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'font-family',
                            content: [symbolizerObj.fontFamily]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'font-size',
                            content: [symbolizerObj.fontSize]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'font-style',
                            content: [symbolizerObj.fontStyle]
                        }, {
                            TYPE_NAME: 'SLD_1_0_0.CssParameter',
                            name: 'font-weight',
                            content: [symbolizerObj.fontWeight]
                        }]
                    },
                    label: {
                        TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                        content: [{
                            name: {
                                key: '{http://www.opengis.net/ogc}PropertyName',
                                localPart: 'PropertyName',
                                namespaceURI: 'http://www.opengis.net/ogc',
                                prefix: 'ogc',
                                string: '{http://www.opengis.net/ogc}' +
                                    'ogc:PropertyName'
                            },
                            value: {
                                TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                                content: [symbolizerObj.labelAttribute]
                            }
                        }]
                    }
                }
            };

            // do we have pointplacement or lineplacement?
            if (symbolizerObj.labelAnchorPointX) {
                sldSymbolizer.value.labelPlacement = {
                    TYPE_NAME: 'SLD_1_0_0.LabelPlacement'
                };
                sldSymbolizer.value.labelPlacement.pointPlacement = {
                    TYPE_NAME: 'SLD_1_0_0.PointPlacement',
                    anchorPoint: {
                        TYPE_NAME: 'SLD_1_0_0.AnchorPoint',
                        anchorPointX: {
                            TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                            content: [symbolizerObj.labelAnchorPointX]
                        },
                        anchorPointY: {
                            TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                            content: [symbolizerObj.labelAnchorPointY]
                        }
                    },
                    displacement: {
                        TYPE_NAME: 'SLD_1_0_0.Displacement',
                        displacementX: {
                            TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                            content: [symbolizerObj.labelDisplacementX]
                        },
                        displacementY: {
                            TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                            content: [symbolizerObj.labelDisplacementY]
                        }
                    },
                    rotation: {
                        TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                        content: [symbolizerObj.labelRotation]
                    }
                };
            } else if (symbolizerObj.perpendicularOffset) {
                sldSymbolizer.value.labelPlacement = {
                    TYPE_NAME: 'SLD_1_0_0.LabelPlacement'
                };
                sldSymbolizer.value.labelPlacement.linePlacement = {
                    perpendicularOffset: {
                        TYPE_NAME: 'SLD_1_0_0.ParameterValueType',
                        content: [symbolizerObj.perpendicularOffset]
                    }
                };
            }
            if (symbolizerObj.labelFollowLine) {
                sldSymbolizer.value.vendorOption = [{
                    TYPE_NAME: 'SLD_1_0_0.VendorOption',
                    name: 'followLine',
                    value: symbolizerObj.labelFollowLine
                }];
            }

            sldObj = BasiGX.util.SLD.setRuleByName(
                ruleName,
                sldSymbolizer,
                sldObj
            );
            return sldObj;
        }
    }
});
