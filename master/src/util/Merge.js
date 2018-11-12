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
 *
 * Utility functions for merging layers and features.
 *
 *
 * @class BasiGX.util.Merge
 */
Ext.define('BasiGX.util.Merge', {
    requires: [
    ],
    statics: {

        /**
         * Extracts the attribute schema from the given layer. Looks for
         * attributes on all features. Excludes fields with name 'id' by
         * default.
         * @param  {ol.layer.Layer} layer the vector layer with the features
         * @param  {Array} ignoreFields an array with field names to ignore
         * @return {Array}       a sorted list of attribute names
         */
        extractSchema: function(layer, ignoreFields) {
            if (!ignoreFields) {
                ignoreFields = ['id'];
            }
            var features = layer.getSource().getFeatures();
            var schema = [];
            Ext.each(features, function(feature) {
                Ext.iterate(feature.getProperties(), function(key, value) {
                    if (value === undefined || value && value.getExtent) {
                        return;
                    }
                    if (!schema.includes(key) && !ignoreFields.includes(key)) {
                        schema.push(key);
                    }
                });
            });
            return schema.sort();
        },

        /**
         * Extracts the selected mapping from the merge window.
         * @param  {Ext.window.Window} win the merge window
         * @return {Object}     a mapping from target layer attribute names to
         * source layer attribute names
         */
        extractMapping: function(win) {
            var combos = win.query('combo');
            var mapping = {};
            Ext.each(combos, function(combo) {
                var value = combo.getValue();
                var original = combo.up().down('label').text;
                mapping[original] = value;
            });
            return mapping;
        },

        /**
         * Extracts the source layer attributes which have been selected for
         * mapping.
         * @param  {Ext.window.Window} win the merge window
         * @return {Array}     the list of attribute names
         */
        extractMappedFields: function(win) {
            var combos = win.query('combo');
            var fields = [];
            Ext.each(combos, function(combo) {
                var value = combo.getValue();
                if (value) {
                    fields.push(value);
                }
            });
            return fields;
        },

        /**
         * Extracts the list of attributes to add from the merge window.
         * @param  {Ext.window.Window} win the merge windowTitle
         * @return {Array}     a list of source layer attributes
         */
        extractToCopyAttributes: function(win) {
            var multiselect = win.down('multiselect');
            var selected = multiselect.getSelected();
            var list = [];
            Ext.each(selected, function(item) {
                list.push(item.get('field1'));
            });
            return list;
        },

        /**
         * Converts a feature to the new schema according to mapping and the
         * toCopy list.
         * @param  {ol.Feature} feature    the feature to convertFeature
         * @param  {Object} mapping    the mapping Object
         * @param  {Array} toCopy     the list of attributes to addDocked
         * @param  {Array} origSchema the original schema of the target layerRec
         * @return {ol.Feature}            the converted feature
         */
        convertFeature: function(feature, mapping, toCopy, origSchema) {
            var geom = feature.getGeometry();
            var newFeature = new ol.Feature(geom);
            Ext.each(origSchema, function(attribute) {
                newFeature.set(attribute, null);
            });
            Ext.iterate(mapping, function(key, value) {
                var val = feature.get(value);
                newFeature.set(key, val ? val : null);
            });
            Ext.each(toCopy, function(attribute) {
                newFeature.set(attribute, feature.get(attribute));
            });
            newFeature.setId('converted_' + feature.getId());
            return newFeature;
        }

    }
});
