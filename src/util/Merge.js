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
 *
 * Merge Util
 *
 * Message box utilities for a common user experience.
 *
 * @class BasiGX.util.Merge
 */
Ext.define('BasiGX.util.Merge', {
    requires: [
    ],
    statics: {

        /*begin i18n*/
        adoptAttributes: 'Select attributes to add to the schema:',
        applyText: 'Apply',
        cancelText: 'Cancel',
        windowTitle: 'Merge features',
        matchText: 'Please select attributes to be mapped:',
        /*end i18n*/

        /**
         * Extracts the attribute schema from the given layer. Looks for
         * attributes on all features. Excludes fields with name 'id'.
         * @param  {ol.layer.Layer} layer the vector layer with the features
         * @return {Array}       a sorted list of attribute names
         */
        extractSchema: function(layer) {
            var features = layer.getSource().getFeatures();
            var schema = [];
            Ext.each(features, function(feature) {
                Ext.iterate(feature.getProperties(), function(key, value) {
                    if (value === undefined || value && value.getExtent) {
                        return;
                    }
                    if (!schema.includes(key) && key !== 'id') {
                        schema.push(key);
                    }
                });
            });
            return schema.sort();
        },

        /**
         * Shows the merge dialog.
         * @param  {ol.layer.Vector} sourceLayer the layer to merge
         * @param  {ol.layer.Vector} targetLayer the layer to merge into
         */
        mergeLayers: function(sourceLayer, targetLayer) {
            var sourceSchema = this.extractSchema(sourceLayer);
            var targetSchema = this.extractSchema(targetLayer);

            var labels = [];
            var dropdowns = [];
            Ext.each(targetSchema, function(attr) {
                labels.push({
                    xtype: 'label',
                    margin: 3,
                    text: attr
                });
                dropdowns.push({
                    xtype: 'combo',
                    store: sourceSchema,
                    displayField: 'name',
                    margin: 3,
                    valueField: 'name',
                    value: sourceSchema.includes(attr) ? attr : '',
                    allowBlank: true
                });
            });

            this.createMergeWindow(labels, dropdowns, sourceLayer, targetLayer,
                sourceSchema, targetSchema);
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
         * Extracts the list of attributes to add from the merge window.
         * @param  {Ext.window.Window} win the merge windowTitle
         * @return {Array}     a list of source layer attributes
         */
        extractToCopyAttributes: function(win) {
            var multiselect = win.down('multiselect');
            var selected = multiselect.getSelected();
            var list = [];
            Ext.each(selected, function(item) {
                list.push(item.data.field1);
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
            return newFeature;
        },

        /**
         * Callback that actually merges the two layers.
         * @param  {ol.layer.Vector} sourceLayer the layer to merge
         * @param  {ol.layer.Vector} targetLayer the layer to merge to
         * @param  {Array} origSchema  the original target layer origSchema
         * @return {Function}             the callback
         */
        applyHandler: function(sourceLayer, targetLayer, origSchema) {
            var me = this;
            return function() {
                var win = this.up('window');
                var newFeatures = sourceLayer.getSource().getFeatures();
                var target = targetLayer.getSource();
                var mapping = me.extractMapping(win);
                var copy = me.extractToCopyAttributes(win);

                Ext.each(newFeatures, function(feature) {
                    var newFeature = me.convertFeature(feature, mapping, copy,
                        origSchema);
                    target.addFeature(newFeature);
                });

                win.destroy();
            };
        },

        /**
         * Callback that just closes/destroys the merge window.
         */
        cancelHandler: function() {
            this.up('window').destroy();
        },

        /**
         * Create the multiselect used to select attributes to add.
         * @param  {Array} attributes the list of attributes
         * @return {Object}            the ext configuration object
         */
        createAttributeSelection: function(attributes) {
            return {
                xtype: 'multiselect',
                margin: 5,
                fieldLabel: this.adoptAttributes,
                store: attributes
            };
        },

        /**
         * Creates the ext config for the label/dropdown vboxes for the merges
         * window.
         * @param  {Array} labels    the labels
         * @param  {Array} dropdowns the attributes list
         * @return {Array}           an array of vbox container configurations
         */
        createDropdownList: function(labels, dropdowns) {
            var vboxes = [];
            for (var i = 0; i < labels.length; ++i) {
                vboxes.push({
                    xtype: 'container',
                    layout: 'vbox',
                    margin: 3,
                    items: [
                        labels[i],
                        dropdowns[i]
                    ]
                });
            }
            return vboxes;
        },

        /**
         * Creates and shows the merge window.
         * @param  {Array} labels       the original attributes label list
         * @param  {Array} dropdowns    the dropdowns with the source layer
         * attributes
         * @param  {ol.layer.Vector} sourceLayer  the layer to merge
         * @param  {ol.layer.Vector} targetLayer  the layer to merge to
         * @param  {Array} sourceSchema the source layer schema
         * @param  {Array} origSchema   the target layer schema
         */
        createMergeWindow: function(
            labels,
            dropdowns,
            sourceLayer,
            targetLayer,
            sourceSchema,
            origSchema
        ) {
            var vboxes = this.createDropdownList(labels, dropdowns);

            var buttons = {
                xtype: 'container',
                layout: 'hbox',
                items: [{
                    xtype: 'button',
                    text: this.applyText,
                    margin: '2 5 2 2',
                    handler: this.applyHandler(sourceLayer, targetLayer,
                        origSchema)
                }, {
                    xtype: 'button',
                    text: this.cancelText,
                    margin: '2 2 2 0',
                    handler: this.cancelHandler
                }]
            };

            var attributeList = this.createAttributeSelection(sourceSchema);

            var container = {
                xtype: 'container',
                layout: 'vbox',
                scrollable: true,
                width: 500,
                items: [{
                    xtype: 'label',
                    text: this.matchText
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    items: vboxes
                },
                    attributeList,
                {
                    xtype: 'buttongroup',
                    rowspan: 2,
                    items: buttons
                }]
            };

            Ext.create({
                xtype: 'window',
                items: container,
                title: this.windowTitle,
                layout: 'fit',
                autoShow: true
            });
        }

    }
});
