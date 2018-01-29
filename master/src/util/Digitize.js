/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class BasiGX.util.Digitize
 */
Ext.define('BasiGX.util.Digitize', {

    statics: {
        /**
         * @param {ol.Collection} collection The feature collection to find in.
         * @param {ol.Feature} clone The cloned feature to get the feature from.
         * @return {ol.Feature} The final feature derived from the `clone`.
         */
        getFeatureFromClone: function(collection, clone) {
            var finalFeature;
            var wktParser = new ol.format.WKT();
            var cloneWktString = wktParser.writeFeature(clone);
            Ext.each(collection.getArray(), function(feature) {
                var featureWktString = wktParser.writeFeature(feature);
                if (cloneWktString === featureWktString) {
                    var id1 = feature.getId();
                    var id2 = clone.getId();
                    if (id1 && id2 && id1 === id2 || !id1 || !id2) {
                        finalFeature = feature;
                    }
                    return false;
                }
            });
            return finalFeature;
        },

        /**
         * Returns a string that is wrapped: every ~`width` chars a space is
         * replaced with the passed `spaceReplacer`.
         *
         * See
         *  http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
         *
         * @param {String} str The string to wrap.
         * @param {Number} width The width of a line (number of characters).
         * @param {String} spaceReplacer The string to replace spaces with.
         * @return {String} The 'wrapped' string.
         */
        stringDivider: function(str, width, spaceReplacer) {
            var me = this;
            var startIndex = 0;
            var stopIndex = width;
            if (str.length > width) {
                var p = width;
                var left;
                var right;
                while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) {
                    p--;
                }
                if (p > 0) {
                    if (str.substring(p, p + 1) === '-') {
                        left = str.substring(0, p + 1);
                    } else {
                        left = str.substring(0, p);
                    }
                    right = str.substring(p + 1);
                    return left + spaceReplacer + me.stringDivider(
                        right, width, spaceReplacer);
                } else {
                    // no whitespace or - found,
                    // splitting hard on the width length
                    left = str.substring(startIndex, stopIndex + 1) + '-';
                    right = str.substring(stopIndex + 1);
                    startIndex = stopIndex;
                    stopIndex += width;
                    return left + spaceReplacer + me.stringDivider(
                        right, width, spaceReplacer);
                }
            }
            return str;
        }
    }
});
