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
        adoptAttributes: 'Adopt attributes',
        applyText: 'Apply',
        cancelText: 'Cancel',
        windowTitle: 'Merge features',
        /*end i18n*/

        extractSchema: function(layer) {
            var features = layer.getSource().getFeatures();
            var schema = [];
            Ext.each(features, function(feature) {
                Ext.iterate(feature.getProperties(), function(key, value) {
                    if (value === undefined || value && value.getExtent) {
                        return;
                    }
                    if (!schema.includes(key)) {
                        schema.push(key);
                    }
                });
            });
            return schema.sort();
        },

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

        extractToCopyAttributes: function(win) {
            var multiselect = win.down('multiselect');
            var selected = multiselect.getSelected();
            var list = [];
            Ext.each(selected, function(item) {
                list.push(item.data.field1);
            });
            return list;
        },

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

        cancelHandler: function() {
            this.up('window').destroy();
        },

        createAttributeSelection: function(attributes) {
            return {
                xtype: 'multiselect',
                margin: 5,
                fieldLabel: this.adoptAttributes,
                store: attributes
            };
        },

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
                items: [{
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
