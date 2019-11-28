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
 * StringTemplate Util
 *
 * This util contains some methods to manipulate string arguments using certain
 * templates.
 *
 * @class BasiGX.util.StringTemplate
 */
Ext.define('BasiGX.util.StringTemplate', {

    requires: [
    ],

    statics: {

        /**
         * The prefix used in a regular expression to match any placeholder
         * field in the provided template.
         *
         * @type {String}
         */
        TEMPLATE_PLACEHOLDER_PREFIX: '{{',

        /**
         * The suffix used in a regular expression to match any placeholder
         * field in the provided template.
         *
         * @type {String}
         */
        TEMPLATE_PLACEHOLDER_SUFFIX: '}}',

        /**
         * Returns the display text for the passed feature using provided
         * template. Can be used for customized representation of
         * feature properties e.g. on hovering or inside of search result
         * grids.
         *
         * @param {ol.Feature} feature The affected feature.
         * @param {String} template The template to fill with feature
         *     attributes.
         * @param {Object} config Object containing template config (suffix and
         *     prefix). Optional.
         * @return {String} The templated feature text.
         */
        getTextFromTemplate: function (feature, template, config) {
            var staticMe = BasiGX.util.StringTemplate;
            var placeHolderPrefix = staticMe.TEMPLATE_PLACEHOLDER_PREFIX;
            var placeHolderSuffix = staticMe.TEMPLATE_PLACEHOLDER_SUFFIX;
            if (config && config.prefix) {
                placeHolderPrefix = config.prefix;
            }
            if (config && config.suffix) {
                placeHolderSuffix = config.suffix;
            }
            var templatedText;

            if (feature && template) {
                // Find any character between two braces (including the braces
                // in the result)
                var regExp = new RegExp(placeHolderPrefix + '(.*?)' +
                        placeHolderSuffix, 'g');
                var regExpRes = template.match(regExp);

                // If we have a regex result, it means we found a placeholder in
                // the template and have to replace the placeholder with its
                // appropriate value
                if (regExpRes) {
                    // Iterate over all regex match results and find the proper
                    // attribute for the given placeholder, finally set the
                    // desired value to the hover field text
                    Ext.each(regExpRes, function (res) {
                        // We count every non matching candidate. If this count
                        // us equal to the objects length, we assume that there
                        // is no match at all and set the output value to an
                        // empty value
                        var noMatchCnt = 0;

                        var props = feature.getProperties ?
                            feature.getProperties() : feature.properties;

                        Ext.iterate(props, function (k, v) {
                            // Remove the suffixes and find the matching
                            // attribute column
                            var phPrefixLength = decodeURIComponent(
                                placeHolderPrefix).length;
                            var phSuffixLength = decodeURIComponent(
                                placeHolderSuffix).length;
                            var placeHolderName = res.slice(phPrefixLength,
                                res.length - phSuffixLength);
                            if (placeHolderName === k) {
                                template = template.replace(res, v);
                                return false;
                            } else {
                                noMatchCnt++;
                            }
                        });

                        // No key match found for this feature (e.g. if key not
                        // present or value is null)
                        if (noMatchCnt === Ext.Object.getSize(props)) {
                            template = template.replace(res, '');
                        }
                        templatedText = template;
                    });
                } else if (feature.get && feature.get(template) &&
                    !Ext.isEmpty(feature.get(template))) {
                    // If we couldn't find any match, the template could be a
                    // simple string containing the e.g. "hoverTemplate".
                    // To obtain backwards-compatibility, we check if this
                    // field is present and set the text accordingly
                    template = feature.get(template);
                    templatedText = template;
                } else {
                    // Try to use "id" as fallback.
                    // If "id" is not available, the value will be "undefined"
                    templatedText = feature.id;
                }
            }

            // Replace all newline breaks with a html <br> tag
            if (Ext.isString(templatedText)) {
                templatedText = templatedText.replace(/\n/g, '<br>');
            }
            return templatedText;
        }
    }
});
