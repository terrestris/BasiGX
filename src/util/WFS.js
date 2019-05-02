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
 * WFS utility.
 *
 * @class BasiGX.util.WFS
 */
Ext.define('BasiGX.util.WFS', {

    requires: [
        'BasiGX.util.CSRF',
        'BasiGX.util.Url',
        'BasiGX.util.Filter',
        'BasiGX.util.Jsonix',
        'BasiGX.util.Namespace'
    ],

    inheritableStatics: {

        /* start i18n*/
        errorMsgTitle: '',
        wfsExecuteExceptionText: '',
        /* end i18n*/

        /**
         * A regular expression that will match an OGC `<ogc:Filter>` element.
         * Captured parts are as follows:
         *
         * * Index `0`: Complete match.
         * * Index `1`: `<ogc:Filter>` start tag including attributes, if any.
         * * Index `2`: Anything between `<ogc:Filter>` start and end tag.
         * * Index `3`: `</ogc:Filter>` end tag.
         *
         * Hat-tip: http://www.regular-expressions.info/examples.html
         */
        reMatchFilter: /(<ogc:Filter\b[^>]*>)(.*?)(<\/ogc:Filter>)/,

        /**
         * The WFS GetFeature XML body template
         */
        wfsGetFeatureXmlTpl: '' +
            '<wfs:GetFeature service="WFS" version="1.1.0"' +
                ' outputFormat="JSON"' +
                ' maxFeatures="{6}"' +
                ' viewParams="{7}"' +
                // {0} is replaced with namespace alias,
                // {1} with namespace URI
                ' xmlns:{0}="{1}"' +
                ' xmlns:wfs="http://www.opengis.net/wfs"' +
                ' xmlns="http://www.opengis.net/ogc"' +
                ' xmlns:gml="http://www.opengis.net/gml"' +
                ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                ' xsi:schemaLocation="http://www.opengis.net/wfs' +
                ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd">' +
                // {2} is replaced with qualified featuretype
                '<wfs:Query typeName="{2}" srsName="{3}">' +
                    '{4}' + // eventually also multiple times for multiple atts:
                    // '<wfs:PropertyName>attname</wfs:PropertyName>'
                    // {5} is replaced with actual filter
                    '{5}' + // Filter
                '</wfs:Query>' +
            '</wfs:GetFeature>',

        /**
         * Returns a BBOX filter for the given map and the passed property name.
         *
         * Implementation very likely to change using Jsonix.
         *
         * @param {ol.Map} map The map to get the extent from.
         * @param {String} propertyName The name of the geometry property of the
         *     featuretype to filter.
         * @param {Array} extent The optional extent Array to use for the filter
         * @param {String} type The type of the filter to create, can either be
         *     `'bbox'`, `'intersects'` or `'both'` (the default). Strings other
         *     than the beforementioned will be interpreted as `'both'`.
         * @return {String} The create BBOX filter.
         */
        getBboxFilter: function(map, propertyName, extent, type) {
            type = type ? (type + '').toLowerCase() : 'both';
            type = (type === 'bbox' || type === 'intersects') ? type : 'both';
            var filters = [];
            if (type === 'bbox' || type === 'both') {
                filters.push(
                    '  <ogc:BBOX>' +
                    '    <ogc:PropertyName>{0}</ogc:PropertyName>' +
                    '    <gml:Envelope' +
                    ' xmlns:gml="http://www.opengis.net/gml" srsName="{1}">' +
                    '      <gml:lowerCorner>{2} {3}</gml:lowerCorner>' +
                    '      <gml:upperCorner>{4} {5}</gml:upperCorner>' +
                    '    </gml:Envelope>' +
                    '  </ogc:BBOX>'
                );
            }
            if (type === 'intersects' || type === 'both') {
                filters.push(
                    '  <ogc:Intersects>' +
                    '    <ogc:PropertyName>{0}</ogc:PropertyName>' +
                    '    <gml:Envelope' +
                    ' xmlns:gml="http://www.opengis.net/gml" srsName="{1}">' +
                    '      <gml:lowerCorner>{2} {3}</gml:lowerCorner>' +
                    '      <gml:upperCorner>{4} {5}</gml:upperCorner>' +
                    '    </gml:Envelope>' +
                    '  </ogc:Intersects>'
                );
            }

            var tpl = BasiGX.util.WFS.combineFilters(filters, 'And', '');
            var mapView = map.getView();
            var srsName = mapView.getProjection().getCode();
            if (!extent) {
                extent = mapView.calculateExtent(map.getSize());
            }
            var filter = Ext.String.format(
                tpl,
                propertyName,
                srsName,
                extent[0], extent[1],
                extent[2], extent[3]
            );
            return filter;
        },
        /**
         * Returns a attribute LIKE filter for the passed property names. Can be
         * combined with `Or` (default) or `And` operator.
         *
         * @param {Array} propertyNames The name of the properties which should
         * be queried.
         * @param {String} queryValue The value to query.
         * @param {String} combinator Should be either `And` or `Or`.
         * @param {Boolean} matchCase If the case should be considered.
         *   Default is false.
         * @param {String} namespace Namespace alias for the XML to be used as
         *   prefix for `PropertyIsLike` filter. Optional. Default is `ogc`.
         * @return {String} The created LIKE filter.
         */
        getAttributeLikeFilter: function(propertyNames, queryValue, combinator,
            matchCase, namespace) {
            var defaultCombineWith = 'Or';
            var defaultMatchCase = false;

            var ogcNs = namespace || 'ogc';
            ogcNs += ':';

            var combineWith = combinator || defaultCombineWith;
            var match = matchCase || defaultMatchCase;

            var tpl = '' +
                ' <PropertyIsLike wildCard="*" singleChar="."' +
                ' escape="!" matchCase="' + match + '">' +
                '      <PropertyName>{0}</PropertyName>' +
                '      <Literal>*{1}*</Literal>' +
                '  </PropertyIsLike>';

            var filter = '<'+ ogcNs + combineWith + '>';
            Ext.each(propertyNames, function(propertyName) {
                filter += Ext.String.format(
                    tpl,
                    propertyName,
                    queryValue
                );
            });
            filter += '</' + ogcNs + combineWith + '>';
            return filter;
        },

        /**
         * Returns an OGC filter for the given CQL Filter.
         * Support for different filters is currently very limited.
         * Only CQL filters having a key, operator and value are supported
         * for now.
         *
         * @param {String} cqlFilter The CQL filter to convert
         * @return {String} The OGC filter.
         */
        getOgcFromCqlFilter: function(cqlFilter) {
            if (!cqlFilter) {
                return;
            }
            var parts = /^\s*([\w_]+)\s*([<>=!]+|in|like)\s*([^\s]+)\s*$/gi
                .exec(cqlFilter);
            if (!parts || parts.length !== 4) {
                Ext.log.error('Method `getOgcFromCqlFilter` can only handle ' +
                'CQL filters with one key, one operator and one value!');
                return;
            }

            var key = parts[1];
            var operator = parts[2].toLowerCase();
            var value = parts[3];
            var ogcFilterType;
            var closingTag;

            // always replace surrounding quotes
            value = value.replace(/(^['])/g, '');
            value = value.replace(/([']$)/g, '');

            switch (operator) {
                case '=':
                    ogcFilterType = 'PropertyIsEqualTo';
                    break;
                case '!=':
                    ogcFilterType = 'PropertyIsNotEqualTo';
                    break;
                case '<':
                    ogcFilterType = 'PropertyIsLessThan';
                    break;
                case '>':
                    ogcFilterType = 'PropertyIsGreaterThan';
                    break;
                case '<=':
                    ogcFilterType = 'PropertyIsLessThanOrEqualTo';
                    break;
                case '>=':
                    ogcFilterType = 'PropertyIsGreaterThanOrEqualTo';
                    break;
                case 'like':
                    ogcFilterType = 'PropertyIsLike';
                    value = '%' + value + '%';
                    break;
                case 'in':
                    ogcFilterType = 'Or';
                    // cleanup brackets and quotes
                    value = value.replace(/([()'])/g, '');
                    var values = value.split(',');
                    var filters = '';
                    Ext.each(values, function(val) {
                        filters +=
                            '<ogc:PropertyIsEqualTo>' +
                            '<ogc:PropertyName>' + key + '</ogc:PropertyName>' +
                            '<ogc:Literal>' + val + '</ogc:Literal>' +
                            '</ogc:PropertyIsEqualTo>';
                    });
                    ogcFilterType = '<ogc:' + ogcFilterType + '>';
                    closingTag = Ext.String.insert(ogcFilterType, '/', 1);
                    return ogcFilterType + filters + closingTag;
                default:
                    Ext.log.warn('Method `getOgcFromCqlFilter` could not ' +
                        'handle the given operator: ' + operator);
                    return;
            }
            ogcFilterType = '<ogc:' + ogcFilterType + '>';
            closingTag = Ext.String.insert(ogcFilterType, '/', 1);
            var tpl = '' +
                '  {0}' +
                '    <ogc:PropertyName>{1}</ogc:PropertyName>' +
                '    <ogc:Literal>{2}</ogc:Literal>' +
                '  {3}';

            var filter = Ext.String.format(
                tpl,
                ogcFilterType,
                key,
                value,
                closingTag
            );
            return filter;
        },

        /**
         * Returns an OGC `PropertyIsLessThanOrEqualTo` and
         * `PropertyIsGreaterThanOrEqualTo` filters with the current TIME taken
         * from the layer source and the given dimensionAttribute
         *
         * @param {ol.layer.Base} layer The layer to get the filter for.
         * @param {String} dimensionAttribute The dimensionAttribute
         *   containing the comma separated start / end keys for WMS TIME
         * @param {String} timeParamFallback The time parameter fallback string
         * @return {Array<String>} An Array containing OGC
         *   `PropertyIsLessThanOrEqualTo` and  `PropertyIsGreaterThanOrEqualTo`
         *   filters regarding to the current TIME taken from the layer source
         *   and set net definition.
         */
        getTimeFilterParts: function(layer, dimensionAttribute,
            timeParamFallback) {

            if (!dimensionAttribute) {
                return;
            }

            var dimensionAttributes = dimensionAttribute.split(',');
            if (dimensionAttributes.length === 1) {
                dimensionAttributes.push(dimensionAttributes[0]);
            }

            var source = layer.getSource();
            var params = source && source.getParams && source.getParams();
            var timeParam = params && params.TIME;
            if (!timeParam && !timeParamFallback) {
                return;
            }
            timeParam = timeParam || timeParamFallback;

            var timeParts = timeParam.split('/');
            var lowerBoundary = timeParts[0];
            var upperBoundary = timeParts[1];
            if (timeParts.length === 1) {
                upperBoundary = timeParts[0];
            }

            // possibly smallest time range value
            var lowerBoundaryTpl = '<ogc:PropertyIsGreaterThanOrEqualTo>' +
                '<ogc:PropertyName>{0}</ogc:PropertyName>' +
                '<ogc:Literal>{1}</ogc:Literal>' +
                '</ogc:PropertyIsGreaterThanOrEqualTo>';

            // possibly biggest time range value
            var upperBoundaryTpl = '<ogc:PropertyIsLessThanOrEqualTo>' +
                '<ogc:PropertyName>{0}</ogc:PropertyName>' +
                '<ogc:Literal>{1}</ogc:Literal>' +
                '</ogc:PropertyIsLessThanOrEqualTo>';

            var lowerBoundaryFilter = Ext.String.format(
                lowerBoundaryTpl,
                Ext.String.trim(dimensionAttributes[1]),
                lowerBoundary
            );

            var upperBoundaryFilter = Ext.String.format(
                upperBoundaryTpl,
                Ext.String.trim(dimensionAttributes[0]),
                upperBoundary
            );

            return [lowerBoundaryFilter, upperBoundaryFilter];
        },

        /**
         * Returns the contents of filter with the outermost `<ogc:Filter>`
         * removed.
         *
         * @param {String} filter The filter to remove `<ogc:Filter>` from.
         * @return {String} The contents of the filter.
         */
        unwrapFilter: function(filter) {
            var regex = BasiGX.util.WFS.reMatchFilter;
            var matches = filter.match(regex);
            if (!matches || matches.length !== 4) {
                return filter;
            }
            return matches[2];
        },

        /**
         * Returns the actually used `<ogc:Filter>` start tag from the passed
         * OGC filter.
         *
         * @param {String} filter The filter to get the `<ogc:Filter>` from.
         * @return {String} The `<ogc:Filter>` of the filter or the empty
         *     string.
         */
        getFilterPrefix: function(filter) {
            var regex = BasiGX.util.WFS.reMatchFilter;
            var matches = filter.match(regex);
            if (!matches || matches.length !== 4) {
                return '';
            }
            return matches[1];
        },

        /**
         * Combines the passed filters with an `<ogc:And>` or `<ogc:Or>` and
         * returns them.
         *
         * @param {Array<String>} filters The filters to join, falsy ones will
         *     be skipped.
         * @param {String} [combinator] The boolean combinator to use, should be
         *     either `And` (the default) or `Or`.
         * @param {String} [filterTag] The tag which should be used at the begin
         *     of the filter string. If you pass the empty string (`''`), the
         *     combined filters will not be wrapped in an `<ogc:Filter>`.
         * @return {String} An combined OGC filter with the passed filters.
         */
        combineFilters: function(filters, combinator, filterTag) {
            var ogcNsUri = 'http://www.opengis.net/ogc';
            var defaultStartTag = '<ogc:Filter xmlns:ogc="' + ogcNsUri + '">';
            var defaultCombineWith = 'And';
            var truthyFilters = Ext.Array.filter(filters, function(filter) {
                return !!filter;
            });
            var numFilters = truthyFilters.length;

            var combineWith = combinator || defaultCombineWith;
            var startFilterTag;
            if (Ext.isDefined(filterTag)) {
                startFilterTag = filterTag;
            } else {
                startFilterTag = defaultStartTag;
            }

            var parts = [];
            parts.push(startFilterTag);

            if (numFilters > 1) {
                parts.push('<ogc:' + combineWith + '>');
            }

            Ext.each(truthyFilters, function(filter) {
                parts.push(filter);
            });

            if (numFilters > 1) {
                parts.push('</ogc:' + combineWith + '>');
            }

            if (startFilterTag !== '') {
                parts.push('</ogc:Filter>');
            }
            return parts.join('');
        },

        /**
         * Combines all configured filters (e.g. spatial and time filter) to
         * one filter string and returns them.
         *
         * @param {Array<String>} filter Given full spatial filter string.
         * @param {String} [combinator] The boolean combinator to use, should be
         *     either `And` or `Or`.
         * @param {String} additionalFilter Additional filter (e.g. time filter)
         *     that should be added to the given filter.
         * @return {String} An OGC And filter with the passed filters.
         */
        insertFilter: function(filter, combinator, additionalFilter) {

            var regex = BasiGX.util.WFS.reMatchFilter;
            var matches = filter.match(regex);
            if (!matches || matches.length !== 4) {
                return filter;
            }
            var allFilters = [];
            var filterStart = matches[1];
            var existingFilter = matches[2];

            allFilters.push(existingFilter);
            Ext.Array.each(additionalFilter, function(af) {
                allFilters.push(af);
            });

            var combined = this.combineFilters(
                allFilters,
                combinator,
                filterStart
            );
            return combined;
        },

        /**
         * Executes a WFS GetFeature request for the passed arguments.
         *
         * TODO Refactor so this doesn't need that much arguments.
         *
         * @param {String} url The URL to the geoserver WFS endpoint
         * @param {ol.layer.Base} layer The layer to query
         * @param {String} srsName The name of the SRS to reporject features to
         * @param {Array} displayColumns The array of columns to display
         * @param {String} geomFieldName The name of the geom field
         * @param {String} filter An OGC 1.1.0 filter in XML format for limiting
         *    the number of returned features.
         * @param {Integer} maxFeatures The maximum number of features to get.
         *    Defaults to 1000 if not set.
         * @param {Function} successCallback A function to call with the
         *    response in case the request finished successfully.
         * @param {Function} failureCallback A function to call with the
         *    response in case the request finished with an error.
         * @param {Object} scope The scope (this-context) of the methods for
         *    success or failure callbacks.
         * @param {String} viewParams the view params to append
         * @return {Ext.data.request.Ajax} The request object.
         */
        executeWfsGetFeature: function(url, layer, srsName, displayColumns,
            geomFieldName, filter, maxFeatures, successCallback,
            failureCallback, scope, viewParams) {
            if (!viewParams) {
                viewParams = '';
            }

            var featureType = layer.getSource().getParams().LAYERS;
            var ns = featureType.split(':')[0];
            var namespaceUtil = BasiGX.util.Namespace;
            var nsUri = namespaceUtil.namespaceUriFromNamespace(ns);

            var staticMe = BasiGX.util.WFS;

            var propertyNameXml = '';
            var propNameTpl = '<wfs:PropertyName>{0}</wfs:PropertyName>';

            if (!Ext.isEmpty(displayColumns)) {
                Ext.each(displayColumns, function(col) {
                    propertyNameXml += Ext.String.format(propNameTpl, col);
                });

                if (!geomFieldName) {
                    geomFieldName = 'geom'; // just a default
                }

                propertyNameXml +=
                    Ext.String.format(propNameTpl, geomFieldName);
            }

            if (!maxFeatures) {
                maxFeatures = 1000;
            }

            var xml = Ext.String.format(
                staticMe.wfsGetFeatureXmlTpl,
                ns,
                nsUri,
                featureType,
                srsName,
                propertyNameXml,
                filter, // OGC 1.1.0. filter as string
                maxFeatures,
                viewParams
            );

            return Ext.Ajax.request({
                headers: BasiGX.util.CSRF.getHeader(),
                url: url,
                method: 'POST',
                xmlData: xml,
                success: successCallback,
                failure: failureCallback,
                scope: scope
            });
        },

        /**
         * A generic function bound as the success callback, if none was
         * provided.
         */
        genericSuccessHandler: function() {
            Ext.log.info('WFS GetFeature executed.');
        },

        /**
         * A generic function bound as the failure callback, if none was
         * provided.
         */
        genericFailureHandler: function() {
            Ext.log.warn('Failed to execute WFS GetFeature.');
        },

        /**
         * If WFS request was successful but response has got an exception,
         * we try to find it out and show the corresponding error message
         *
         * @param {Object} response The response of the Ajax call.
         */
        handleWfsExecuteException: function(response) {
            var staticMe = BasiGX.util.WFS;
            var util = BasiGX.util.Jsonix;
            var parsedXml = util.unmarshaller.unmarshalString(response);
            if (parsedXml && parsedXml.value && parsedXml.value.exception[0]) {
                var excReport = parsedXml.value.exception[0];
                var excCode = excReport.exceptionCode;
                var excMsg = excReport.exceptionText[0];
                var excTitlePrefix = staticMe.errorMsgTitle;
                var excTitle = excTitlePrefix + ': ' + excCode;
                BasiGX.util.MsgBox.error(
                    Ext.String.format(
                        staticMe.wfsExecuteExceptionText,
                        excMsg
                    ),
                    {title: excTitle}
                );
            }
        },

        /**
         * Builds the full filter encoding object from all given filters
         * (spatial, time and SLD) and sends it as parameter for the WFS
         * GetFeature request for selection.
         *
         * Suppose you have the following filters:
         *
         * * `spatialFilter`, let's call this `F1`
         * * `timeFilter`, call this `F2`
         * * `sldFilters`, an array of `F3` and `F4`
         *
         * This method will combine these filters as follows:
         *
         *     F1    AND    F2    AND    (  F3    OR    F4  )
         *
         * @param {ol.layer.Base} filterLayer The layer to handle
         * @param {String} spatialFilter Filter encoding for spatial filter.
         * @param {String} timeFilterParts Filter encoding for time filter
         *     containing two OGC filters - `PropertyIsGreaterThanOrEqualTo` and
         *     `PropertyIsLessThanOrEqualTo`.
         * @param {Array} sldFilters Array containing filter encodings for SLD
         *     filters.
         * @param {Function} successCallback A function to call with the
         *     response in case the request finished successfully.
         * @param {Function} failureCallback A function to call with the
         *     response in case the request finished with an error.
         * @param {Object} scope The scope (this-context) of the methods for
         *     success or failure callbacks.
         */
        getFullFilterAndApplyIt: function(filterLayer, spatialFilter,
            timeFilterParts, sldFilters, successCallback, failureCallback,
            scope) {
            var staticMe = BasiGX.util.WFS;
            var spatialTimeFilterPart = staticMe.insertFilter(
                spatialFilter, 'And', timeFilterParts
            );
            var mapComponent = BasiGX.util.Map.getMapComponent();
            var srs = mapComponent.map.getView().getProjection().getCode();

            var filter = spatialTimeFilterPart; // fallback
            filter = staticMe.mergeFilterWithSldFilters(filter, sldFilters);

            if (!Ext.isEmpty(filter)) {
                mapComponent.setLoading(true);

                var displayColumns = filterLayer.get('displayColumns');
                var geomFieldName = filterLayer.get('geomFieldName');

                staticMe.executeWfsGetFeature(
                    filterLayer.getSource().getUrls()[0],
                    filterLayer,
                    srs,
                    displayColumns,
                    geomFieldName,
                    filter,
                    null,
                    successCallback,
                    failureCallback,
                    scope,
                    null
                );
            }
        },

        /**
         * This function will return a filter string containing a bbox filter,
         * the passed sldFilters and a possible time filter (if the layer is
         * configured as WMS-T).
         *
         * @param {ol.layer.Base} layer The layer to get the filter for.
         * @param {String} dimensionAttribute The dimensionAttribute
         *      containing the comma separated start / end keys for WMS TIME
         * @param {Array} sldFilters An array of filter strings coming
         *   from the SLD.
         * @param {ol.Map} map optional map parameter. Will be guessed if
         *   not passed.
         * @param {String} geomFieldName The name of the geom field
         * @param {Array} extent The optional extent Array to use for the bbox
         *    filter
         * @return {String} filter string as described above
         */
        getTimeAndSldCompliantFilter: function(
            layer, dimensionAttribute, sldFilters, map, geomFieldName, extent) {
            var staticMe = BasiGX.util.WFS;

            // guess the map if it has not been passed
            if (!map) {
                map = BasiGX.util.Map.getMapComponent().map;
            }

            var allFilters = [];
            var timeFilterParts = staticMe.getTimeFilterParts(
                layer, dimensionAttribute);
            if (timeFilterParts) {
                allFilters = timeFilterParts;
            }
            if (extent) {
                var bboxFilter = staticMe.getBboxFilter(
                    map,
                    geomFieldName,
                    extent
                );
                allFilters.push(bboxFilter);
            }

            var filter = staticMe.combineFilters(allFilters);

            return staticMe.mergeFilterWithSldFilters(filter, sldFilters);
        },

        /**
         * Merge the passed "base" filter with the passed sld filters.
         *
         * @param {String} filter string representing some "base" filter
         *   (e.g. time/spatial)
         * @param {Array} sldFilters An array of filter strings coming
         *   from the SLD.
         *
         * @return {String} filter string representing the merge of the passed
         *   filter with the passed sld filters
         */
        mergeFilterWithSldFilters: function(filter, sldFilters) {
            var staticMe = BasiGX.util.WFS;
            var plainSldFilters = [];
            Ext.each(sldFilters, function(sldFilter) {
                plainSldFilters.push(staticMe.unwrapFilter(sldFilter));
            });

            if (plainSldFilters.length > 0) {
                // we had some SLD filters, and need to add them to the
                // existing one
                var orCombinedSldFilter = staticMe.combineFilters(
                    plainSldFilters, 'Or', ''
                );
                filter = staticMe.insertFilter(
                    filter, 'And', orCombinedSldFilter
                );
            }
            return filter;
        }
    }
});
