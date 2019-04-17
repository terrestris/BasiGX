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
 * Utility class containing static methods to create a filter encoding objects
 * depending on given layer attribute filter configuration.
 *
 * @class BasiGX.util.Filter
 */
Ext.define('BasiGX.util.Filter', {

    statics: {

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
         * This method will be used to create simple filter without logical
         * operators and nesting.
         *
         * Output after marshalling via Jsonix could be e.g. as follows:
         *
         *     <ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'
         *                 xmlns:gml='http://www.opengis.net/gml'
         *                 xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
         *                 xmlns:xlink='http://www.w3.org/1999/xlink'>
         *         <ogc:PropertyIsLike wildCard='*' singleChar='%' escape='!'>
         *             <ogc:PropertyName>neid</ogc:PropertyName>
         *             <ogc:Literal>01VD2</ogc:Literal>
         *         </ogc:PropertyIsLike>
         *     </ogc:Filter>
         *
         * @param {Object} filterValues A representation of filter values coming
         *     from our form for defining them.
         * @return {Object} An object representing a simple OGC filter 1.0.0;
         *     ready to be stringified using Jsonix.
         */
        filterValuesToSimpleFilter: function(filterValues) {
            var simpleFilter = {
                value: {
                    TYPE_NAME: 'Filter_1_0_0.FilterType',
                    comparisonOps: {
                        name: {
                            namespaceURI: 'http://www.opengis.net/ogc',
                            localPart: filterValues.operator,
                            prefix: 'ogc',
                            key: '{http://www.opengis.net/ogc}' +
                            filterValues.operator,
                            string: '{http://www.opengis.net/ogc}ogc:' +
                                filterValues.operator
                        },
                        value: {
                            TYPE_NAME: 'Filter_1_0_0.BinaryComparisonOpType',
                            expression: [{
                                name: {
                                    namespaceURI: 'http://www.opengis.net/ogc',
                                    localPart: 'PropertyName',
                                    prefix: 'ogc',
                                    key: '{http://www.opengis.net/ogc}' +
                                        'PropertyName',
                                    string: '{http://www.opengis.net/ogc}' +
                                        'ogc:PropertyName'
                                },
                                value: {
                                    TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                                    content: [filterValues.attribute]
                                }
                            }, {
                                name: {
                                    namespaceURI: 'http://www.opengis.net/ogc',
                                    localPart: 'Literal',
                                    prefix: 'ogc',
                                    key: '{http://www.opengis.net/ogc}Literal',
                                    string: '{http://www.opengis.net/ogc}' +
                                        'ogc:Literal'
                                },
                                value: {
                                    TYPE_NAME: 'Filter_1_0_0.LiteralType',
                                    content: [filterValues.filterValue]
                                }
                            }]
                        }
                    }
                },
                name: {
                    namespaceURI: 'http://www.opengis.net/ogc',
                    localPart: 'Filter',
                    prefix: 'ogc',
                    key: '{http://www.opengis.net/ogc}Filter',
                    string: '{http://www.opengis.net/ogc}' +
                        'ogc:Filter'
                }
            };

            switch (filterValues.operator) {
                case 'PropertyIsEqualTo':
                    break;
                case 'PropertyIsNotEqualTo':
                    break;
                case 'PropertyIsBetween':
                    simpleFilter.value.comparisonOps.value = {
                        TYPE_NAME: 'Filter_1_0_0.PropertyIsBetweenType',
                        expression: {
                            name: {
                                namespaceURI: 'http://www.opengis.net/ogc',
                                localPart: 'PropertyName',
                                prefix: 'ogc',
                                key: '{http://www.opengis.net/ogc}PropertyName',
                                string: '{http://www.opengis.net/ogc}' +
                                    'ogc:PropertyName'
                            },
                            value: {
                                TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                                content: [filterValues.attribute]
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
                                        'ogc:Literal'
                                },
                                value: {
                                    TYPE_NAME: 'Filter_1_0_0.LiteralType',
                                    content: [filterValues
                                        .minBoundary.toString()]
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
                                        'ogc:Literal'
                                },
                                value: {
                                    TYPE_NAME: 'Filter_1_0_0.LiteralType',
                                    content: [filterValues
                                        .maxBoundary.toString()]
                                }
                            }
                        }
                    };
                    break;
                case 'PropertyIsLike':
                    simpleFilter.value.comparisonOps.value = {
                        TYPE_NAME: 'Filter_1_0_0.PropertyIsLikeType',
                        wildCard: '*',
                        singleChar: '%',
                        escape: '!',
                        propertyName: {
                            TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                            content: [filterValues.attribute]
                        },
                        literal: {
                            TYPE_NAME: 'Filter_1_0_0.LiteralType',
                            content: [filterValues.filterValue]
                        }
                    };
                    break;
                case 'PropertyIsLessThan':
                case 'PropertyIsLessThanOrEqualTo':
                case 'PropertyIsGreaterThan':
                case 'PropertyIsGreaterThanOrEqualTo':
                    simpleFilter.value.comparisonOps.value.expression[1] = {
                        name: {
                            namespaceURI: 'http://www.opengis.net/ogc',
                            localPart: 'Literal',
                            prefix: 'ogc',
                            key: '{http://www.opengis.net/ogc}Literal',
                            string: '{http://www.opengis.net/ogc}ogc:Literal'
                        },
                        value: {
                            TYPE_NAME: 'Filter_1_0_0.LiteralType',
                            content: [filterValues.filterValue]
                        }
                    };
                    break;
                default:
                    break;
            }
            return simpleFilter;
        },

        /**
         * This method will be used to create more complex nested filter
         * including logical operators AND and OR.
         *
         * **Note:** Multiple nesting is not supported yet.
         *
         * Output after marshalling via Jsonix could be e.g. as follows:
         *
         *     <ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'
         *                 xmlns:gml='http://www.opengis.net/gml'
         *                 xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
         *                 xmlns:xlink='http://www.w3.org/1999/xlink'>
         *         <ogc:Or>
         *             <ogc:PropertyIsLike wildCard='*'
         *                  singleChar='%' escape='!'>
         *                 <ogc:PropertyName>neid</ogc:PropertyName>
         *                 <ogc:Literal>02VD2</ogc:Literal>
         *             </ogc:PropertyIsLike>
         *             <ogc:PropertyIsGreaterThanOrEqualTo>
         *                 <ogc:PropertyName>cellid</ogc:PropertyName>
         *                 <ogc:Literal>0</ogc:Literal>
         *             </ogc:PropertyIsGreaterThanOrEqualTo>
         *         </ogc:Or>
         *     </ogc:Filter>
         *
         * @param {Array} filterValuesArray An array of filter values coming
         *     from our form for defining them.
         * @param {String} logicalOp A string defining the logical operation
         *     used for the combination. Either `'Or'` or `'And'`.
         * @return {Object} A logically combining object with the passed filters
         *     that is ready to be serialized to a string by Jsonix.
         */
        filterValuesToLogicalFilter: function(filterValuesArray, logicalOp) {
            var filterUtil = BasiGX.util.Filter;
            var logicalFilter = {
                name: {
                    namespaceURI: 'http://www.opengis.net/ogc',
                    localPart: 'Filter',
                    prefix: 'ogc',
                    key: '{http://www.opengis.net/ogc}Filter',
                    string: '{http://www.opengis.net/ogc}' +
                        'ogc:Filter'
                },
                value: {
                    TYPE_NAME: 'Filter_1_0_0.FilterType',
                    logicOps: {
                        name: {
                            namespaceURI: 'http://www.opengis.net/ogc',
                            localPart: logicalOp,
                            prefix: 'ogc',
                            key: '{http://www.opengis.net/ogc}' + logicalOp,
                            string: '{http://www.opengis.net/ogc}ogc:'
                                + logicalOp
                        },
                        value: {
                            TYPENAME: 'Filter_1_0_0.BinaryLogicOpType',
                            ops: []
                        }
                    }
                }
            };

            Ext.each(filterValuesArray, function(filterValues) {
                var simpleFilter =
                    filterUtil.filterValuesToSimpleFilter(filterValues);

                logicalFilter.value.logicOps.value.ops.push(
                    simpleFilter.value.comparisonOps
                );
            });
            return logicalFilter;
        },

        /**
         * This method will be used to create simple spatial filter (e.g. for
         * INTERSECT, CONTAIN or OVERLAP operations). Currently only INTERSECT
         * filter will be supported.
         * Output after marshalling via Jsonix could be e.g. as follows:
         *
         *    <ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'
         *                xmlns:gml='http://www.opengis.net/gml'
         *                xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'
         *                xmlns:xlink='http://www.w3.org/1999/xlink'
         *                xmlns:ows='http://www.opengis.net/ows/1.1'
         *                xmlns:wps='http://www.opengis.net/wps/1.0.0'>
         *       <ogc:Intersects>
         *           <ogc:PropertyName>geom</ogc:PropertyName>
         *           <gml:Polygon srsName='EPSG:25832'>
         *               <gml:exterior>
         *                   <gml:LinearRing>
         *                       <gml:posList>
         *                            680504.3137212421 5639437.573
         *                            680498.5086607657 5639496.512768128
         *                            [...]
         *                            680504.3137212421 5639437.573
         *                        </gml:posList>
         *                    </gml:LinearRing>
         *                </gml:exterior>
         *            </gml:Polygon>
         *        </ogc:Intersects>
         *    </ogc:Filter>
         *
         *    @param {Array} geom Coordinates array
         *    @param {String} proj Projection string (e.g. EPSG:25832)
         *    @param {String} geomName Name of geometry column (e.g. geom)
         *    @param {String} geomType The geometry type
         *    @param {String} spatialOperator The spatial operator
         *    @return {String} The spatial filter
         */
        filterGeometryToIntersectionFilter: function(geom, proj, geomName,
            geomType, spatialOperator) {
            var ogcNsUri = 'http://www.opengis.net/ogc';
            var gmlNsUri = 'http://www.opengis.net/gml';
            var spatialFilter = {
                name: {
                    key: '{' + ogcNsUri + '}Filter',
                    localPart: 'Filter',
                    namespaceURI: ogcNsUri,
                    prefix: 'ogc',
                    string: '{' + ogcNsUri + '}Filter'
                },
                value: {
                    TYPE_NAME: 'Filter_1_0_0.FilterType',
                    spatialOps: {
                        name: {
                            key: '{' + ogcNsUri + '}' + spatialOperator,
                            localPart: spatialOperator,
                            namespaceURI: ogcNsUri,
                            prefix: 'ogc',
                            string: '{' + ogcNsUri + '}ogc:' + spatialOperator
                        },
                        value: {
                            TYPENAME: 'Filter_1_0_0.BinarySpatialOpType',
                            geometry: {
                                name: {
                                    key: '{' + gmlNsUri + '}' + geomType,
                                    localPart: geomType,
                                    namespaceURI: gmlNsUri,
                                    prefix: 'gml',
                                    string: '{' + gmlNsUri + '}gml:' + geomType
                                },
                                value: {
                                    TYPE_NAME: 'GML_3_1_1.' + geomType + 'Type',
                                    srsName: proj
                                }
                            },
                            propertyName: {
                                TYPE_NAME: 'Filter_1_0_0.PropertyNameType',
                                content: [geomName]
                            }
                        }
                    }
                }
            };

            switch (geomType) {
                case 'Polygon':
                    spatialFilter.value.spatialOps.value.geometry
                        .value.exterior = {
                            name: {
                                key: '{' + gmlNsUri + '}exterior',
                                localPart: 'exterior',
                                namespaceURI: gmlNsUri,
                                prefix: 'gml',
                                string: '{' + gmlNsUri + '}gml:exterior'
                            },
                            value: {
                                TYPE_NAME: 'GML_3_1_1.AbstractRingPropertyType',
                                ring: {
                                    name: {
                                        key: '{' + gmlNsUri + '}LinearRing',
                                        localPart: 'LinearRing',
                                        namespaceURI: gmlNsUri,
                                        prefix: 'gml',
                                        string: '{' + gmlNsUri +
                                            '}gml:LinearRing'
                                    },
                                    value: {
                                        TYPE_NAME: 'GML_3_1_1.LinearRingType',
                                        posList: {
                                            TYPE_NAME: 'GML_3_1_1.' +
                                                'DirectPositionListType',
                                            value: geom
                                        }
                                    }
                                }
                            }
                        };
                    break;
                case 'LineString':
                    spatialFilter.value.spatialOps.value.geometry.value = {
                        TYPE_NAME: 'GML_3_1_1.LineStringType',
                        posList: {
                            TYPE_NAME: 'GML_3_1_1.DirectPositionListType',
                            value: geom
                        }
                    };
                    break;
                default:
                    break;
            }

            return spatialFilter;
        }
    }
});
