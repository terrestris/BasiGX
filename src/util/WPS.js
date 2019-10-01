/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * WPS utility.
 *
 * @class BasiGX.util.WPS
 */
Ext.define('BasiGX.util.WPS', {

    requires: [
        'BasiGX.util.CSRF',
        'BasiGX.util.Jsonix',
        'BasiGX.util.Url',
        'BasiGX.util.Filter',
        'BasiGX.util.Namespace',
        'BasiGX.util.WFS'
    ],

    inheritableStatics: {

        /* start i18n*/
        errorMsgTitle: '',
        wpsExecuteExceptionText: '',
        /* end i18n*/

        /**
         * Creates a Jsonix object conform to OGC `wps:Execute` XML document.
         * At the moment it will be assumed that we always return a JSON object
         * in `wps:ResponseForm`. If this should be changed, the related hard
         * coded block below should be adjusted.
         *
         * `wps:DataInputs` block will be determined via
         * #requestParamstoWpsInputs method.
         *
         * Output after marshaling via Jsonix could be e.g. as follows
         * (here as example for `gs:ElevationProfile` WPS process,
         * the huge `<wps:DataInputs>` block is intentionally left out).
         *
         *    <wps:Execute xmlns:wps="http://www.opengis.net/wps/1.0.0"
         *         xmlns:ogc="http://www.opengis.net/ogc"
         *         xmlns:gml="http://www.opengis.net/gml"
         *         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         *         xmlns:xlink="http://www.w3.org/1999/xlink"
         *         xmlns:ows="http://www.opengis.net/ows/1.1"
         *         xmlns:wcs="http://www.opengis.net/wcs/1.1"
         *         service="WPS" version="1.0.0">
         *        <ows:Identifier>gs:ElevationProfile</ows:Identifier>
         *        <wps:DataInputs>...</wps:DataInputs>
         *        <wps:ResponseForm>
         *            <wps:RawDataOutput mimeType="application/json">
         *                <ows:Identifier>result</ows:Identifier>
         *            </wps:RawDataOutput>
         *        </wps:ResponseForm>
         *    </wps:Execute>
         *
         * @param {String} wpsIdentifier Name of WPS process to be executed
         * @param {Array<Object>} inputs Array of objects containing values
         *     to each WPS input parameter.
         * @return {Object} Jsonix object to be marshaled to XML
         *     `wps:Execute` document.
         *
         */
        createWpsExecuteProcessObject: function (wpsIdentifier, inputs) {
            var staticMe = BasiGX.util.WPS;
            var executeDoc = {
                name: {
                    namespaceURI: 'http://www.opengis.net/wps/1.0.0',
                    localPart: 'Execute',
                    prefix: 'wps',
                    key: '{http://www.opengis.net/wps/1.0.0}Execute',
                    string: '{http://www.opengis.net/wps/1.0.0}wps:Execute'
                },
                value: {
                    TYPE_NAME: 'WPS_1_0_0.Execute',
                    version: '1.0.0',
                    service: 'WPS',
                    identifier: {
                        TYPE_NAME: 'OWS_1_1_0.CodeType',
                        value: wpsIdentifier
                    },
                    dataInputs: {
                        TYPE_NAME: 'WPS_1_0_0.DataInputsType',
                        input: staticMe.requestParamstoWpsInputs(inputs)
                    },
                    responseForm: {
                        TYPE_NAME: 'WPS_1_0_0.ResponseFormType',
                        rawDataOutput: {
                            TYPE_NAME: 'WPS_1_0_0.OutputDefinitionType',
                            mimeType: 'application/json',
                            identifier: {
                                TYPE_NAME: 'OWS_1_1_0.CodeType',
                                value: 'result'
                            }
                        }
                    }
                }
            };
            return executeDoc;
        },

        /**
         * Creates a part of Jsonix `wps:Execute` object related to
         * `wps:DataInputs`.
         *
         * At the moment the following input types are supported:
         *   * `coverage`
         *     * Defined as `wps:Reference`to OGC WCS service.
         *   * `geometry`
         *     * Defined as `wps:ComplexData` in CDATA format.
         *   * `vertexCount`
         *     * Defined as `wps:LiteralData`, will be used in
         *          `eg:ElevationProfile` WPS process.
         *
         * @param {Array<Object>} inputs Array of objects containing values
         *     to each WPS input parameter.
         * @return {Array<Object>} Array of Jsonix objects to be marshaled to
         *      XML `wps:Input` document block.
         */
        requestParamstoWpsInputs: function (inputs) {
            var staticMe = BasiGX.util.WPS;
            var wpsInput = [];
            var singleInput = {};
            for (var identifier in inputs) {
                singleInput = {
                    TYPE_NAME: 'WPS_1_0_0.InputType',
                    identifier: {
                        TYPE_NAME: 'OWS_1_1_0.CodeType',
                        value: identifier
                    }
                };
                var inputValue = inputs[identifier];
                if (Ext.isObject(inputValue)) {
                    if (Object.prototype.hasOwnProperty.call(inputValue,
                        'identifier')) {
                        if (Object.prototype.hasOwnProperty.call(inputValue,
                            'wfsProperties')) {
                            var namespace = inputValue.wfsProperties.namespace;
                            var namespaceUri = inputValue.wfsProperties.
                                namespaceUri;
                            var featureType = inputValue.wfsProperties.
                                featureType;
                            var crs = inputValue.wfsProperties.crs ||
                                'EPSG:4326';
                            var propertyNameXml = inputValue.wfsProperties
                                .propertyNameXml || '';
                            var filter = inputValue.wfsProperties
                                .filter || '';
                            var viewParams = inputValue.wfsProperties
                                .viewParams || '';
                            var maxFeatures = inputValue.wfsProperties
                                .maxFeatures;
                            var content = Ext.String.format(
                                BasiGX.util.WFS.wfsGetFeatureXmlTpl,
                                namespace,
                                namespaceUri,
                                featureType,
                                crs,
                                propertyNameXml,
                                filter,
                                maxFeatures,
                                viewParams
                            );
                            if (!Ext.isDefined(maxFeatures)) {
                                // Replace maxFeatures string by an empty one
                                content = content.replace('maxFeatures=""', '');
                            }
                            singleInput.reference = {
                                TYPE_NAME: 'WPS_1_0_0.InputReferenceType',
                                mimeType: 'text/xml',
                                href: 'http://geoserver/wfs',
                                method: 'POST',
                                body: {
                                    TYPE_NAME: 'AnyType',
                                    content: [content]
                                }
                            };
                        } else {
                            // we have a reference
                            // TODO at the moment only reference to a coverage
                            // will be supported
                            singleInput.reference = {
                                TYPE_NAME: 'WPS_1_0_0.InputReferenceType',
                                mimeType: 'image/tiff',
                                href: 'http://geoserver/wcs',
                                method: 'POST',
                                body: {
                                    TYPE_NAME: 'AnyType',
                                    content: [
                                        staticMe.getGetCoverageRequestXml(
                                            inputValue.identifier
                                        )
                                    ]
                                }
                            };
                        }
                    } else if (Object.prototype.hasOwnProperty.call(inputValue,
                        'mimeType') && Object.prototype.hasOwnProperty
                        .call(inputValue, 'data')) {
                        // we have a CDATA (e.g. geometry) input
                        singleInput.data = {
                            TYPE_NAME: 'WPS_1_0_0.DataType',
                            complexData: {
                                TYPE_NAME: 'WPS_1_0_0.ComplexDataType',
                                mimeType: inputValue.mimeType,
                                content: [
                                    '<![CDATA[' + inputValue.data + ']]>'
                                ]
                            }
                        };
                    }
                } else {
                    // we have literal data hier
                    singleInput.data = {
                        TYPE_NAME: 'WPS_1_0_0.DataType',
                        literalData: {
                            TYPE_NAME: 'WPS_1_0_0.LiteralDataType',
                            value: inputValue.toString()
                        }
                    };
                }
                wpsInput.push(singleInput);
            }
            return wpsInput;
        },

        /**
         * Creates a Jsonix object conform to WCS GetCoverage request and
         * marshals it to the related XML document.
         *
         * @param {String} coverage Name of the coverage which should be
         *     requested via WCS GetCoverage.
         * @return {String} Parsed XML request for the WCS GetCoverage.
         */
        getGetCoverageRequestXml: function (coverage) {

            var json = {
                name: {
                    namespaceURI: 'http://www.opengis.net/wcs/1.1.1',
                    localPart: 'GetCoverage',
                    prefix: 'wcs',
                    key: '{http://www.opengis.net/wcs/1.1.1}GetCoverage',
                    string: '{http://www.opengis.net/wcs/1.1.1}GetCoverage'
                },
                value: {
                    TYPE_NAME: 'WCS_1_1.GetCoverage',
                    version: '1.1.1',
                    service: 'WCS',
                    identifier: {
                        TYPE_NAME: 'OWS_1_1_0.CodeType',
                        value: coverage
                    },
                    domainSubset: {
                        TYPE_NAME: 'WCS_1_1.DomainSubsetType'
                    },
                    output: {
                        TYPE_NAME: 'WCS_1_1.OutputType',
                        format: 'image/tiff'
                    }
                }
            };
            return BasiGX.util.Jsonix.marshaller.marshalString(json);
        },

        /**
         * Execute a call to the given WPS process.
         *
         * Pass `success` or `failure` callback to process the response of the
         * WPS call.
         *
         * @param {String} process Name of the WPS to be executed.
         * @param {Object} inputs An object containing all inputs.
         * @param {Function} [success] The callback to invoke when the execution
         *     call succeeded. Will receive the XMLHttpRequest object containing
         *     the response data as first argument. Additionally, the second
         *     argument will be the parameters to the request call. Optional.
         * @param {Function} [failure] The callback to invoke when the execution
         *     call failed. Will receive the XMLHttpRequest object containing
         *     the response data as first argument. Additionally, the second
         *     argument will be the parameters to the request call. Optional.
         * @param {Object} [scope] The scope to be used in the provided callback
         *     functions. If not provided, the scope is set to the global
         *     window. Optional.
         * @param {Number} timeout The timeout in milliseconds to use for the
         *     request. Default is to 30.000 ms (30 s).
         * @return {Ext.data.request.Ajax} The request object which on may use
         *     to e.g. abort the request.
         */
        execute: function (process, inputs, success, failure, scope, timeout) {
            var staticMe = BasiGX.util.WPS;
            var namespaceUtil = BasiGX.util.Namespace;

            if (!Ext.isDefined(success)) {
                success = staticMe.genericSuccessHandler;
            }
            if (!Ext.isDefined(failure)) {
                failure = staticMe.genericFailureHandler;
            }

            var jsonixExecuteObj = staticMe.createWpsExecuteProcessObject(
                process, inputs
            );
            var xml =
                BasiGX.util.Jsonix.marshaller.marshalString(jsonixExecuteObj);
            var decodedXml = staticMe.decodeXml(xml);

            var namespace = namespaceUtil.namespaceFromFeatureType(process);

            return staticMe.executeProcess(
                decodedXml, namespace, success, failure, scope, timeout
            );
        },

        /**
         * Execute a call to a WPS process.
         *
         * @param {String} xml The `<wps:Execute>`-xml to send.
         * @param {String} namespace The namespace of the process to execute.
         * @param {Function} success The callback to invoke when the
         *     execution call succeeded. Will receive the response object of the
         *     request.
         * @param {Function} failure The callback to invoke when the
         *     execution call failed. Will receive the response object of the
         *     request.
         * @param {Object} scope The scope to be used in the provided callback
         *     functions. If not provided, the scope is set to the global
         *     window.
         * @param {Number} timeout The timeout in milliseconds to use for the
         *     request. Default is to 30.000 ms (30 s).
         * @return {Ext.data.request.Ajax} The request object which on may use
         *     to e.g. abort the request.
         * @private
         */
        executeProcess: function (xml, namespace, success, failure, scope,
            timeout) {
            var baseUrl = BasiGX.util.Url.getWebProjectBaseUrl();

            return Ext.Ajax.request({
                headers: BasiGX.util.CSRF.getHeader(),
                url: baseUrl + 'geoserver.action',
                // Pass on certain technically unneeded request paramters, which
                // `geoserver.action` can use do determine a final URL to pass
                // the request through to.
                //
                // TODO Future enhancements might keep only the `namespace`,
                //      this would mean that we would change the backend to skip
                //      detection of the target URL if a namespace parameter is
                //      found.
                params: {
                    service: 'WPS',
                    request: 'Execute',
                    version: '1.0.0',
                    namespace: namespace
                },
                method: 'POST',
                xmlData: xml,
                success: success,
                failure: failure,
                scope: scope,
                timeout: timeout
            });
        },

        /**
         * A generic function bound as the success callback, if none was
         * provided.
         */
        genericSuccessHandler: function () {
            Ext.log.info('WPS process executed.');
        },

        /**
         * A generic function bound as the failure callback, if none was
         * provided.
         */
        genericFailureHandler: function () {
            Ext.log.warn('Failed to execute WPS process.');
        },

        /**
         * If WPS request was successful but response has got an exception,
         * we try to find it out and show the corresponding error message
         *
         * @param {Object} response The response of the successful Ajax call
         *     which is a ServiceException.
         */
        handleWpsExecuteException: function (response) {
            var staticMe = BasiGX.util.WPS;
            var jsonixUtil = BasiGX.util.Jsonix;
            var parsedXml = jsonixUtil.unmarshaller.unmarshalString(response);
            var excReport;
            if (parsedXml && parsedXml.value) {
                if (parsedXml.value.exception) {
                    excReport = parsedXml.value.exception[0];
                } else if (parsedXml.value.status &&
                    parsedXml.value.status.processFailed &&
                    parsedXml.value.status.processFailed.exceptionReport) {
                    excReport = parsedXml.value.status.processFailed
                        .exceptionReport.exception[0];
                }
                var excCode = excReport.exceptionCode;
                var excMsg = excReport.exceptionText[0];
                var excTitlePrefix = staticMe.errorMsgTitle;
                var excTitle = excTitlePrefix + ': ' + excCode;
                BasiGX.util.MsgBox.error(
                    Ext.String.format(
                        staticMe.wpsExecuteExceptionText,
                        excMsg
                    ),
                    { title: excTitle }
                );
            }
        },

        /**
         * Decodes encoded HTML characters like `greater than` (>) or `less
         *    then` (<) back to the symbols.
         *
         * @param {String} xmlString XML or HTML document to be decoded.
         * @return {String} Decoded XML or HTML document.
         */
        decodeXml: function (xmlString) {
            var map = {
                '&lt;': '<',
                '&gt;': '>'
            };
            return xmlString.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
                function (str, item) {
                    return map[item];
                }
            );
        }
    }
});
