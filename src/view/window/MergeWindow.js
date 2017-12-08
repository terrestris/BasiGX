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
 * A window where the user can configure the merging of two layers.
 *
 * @class BasiGX.view.window.MergeWindow
 */
Ext.define('BasiGX.view.window.MergeWindow', {
    xtype: 'basigx-window-merge',
    extend: 'Ext.window.Window',
    requires: [
        'BasiGX.util.Merge'
    ],

    viewModel: {
        data: {
            adoptAttributes: 'Select attributes to add to the schema:',
            applyText: 'Apply',
            cancelText: 'Cancel',
            windowTitle: 'Merge features',
            matchText: 'Please select attributes to be mapped:'
        }
    },

    bind: {
        title: '{windowTitle}'
    },

    layout: 'fit',
    autoShow: true,
    items: [],
    bodyPadding: 5,

    config: {
        /**
         * The layer to merge.
         * @type {ol.layer.Vector}
         */
        sourceLayer: null,
        /**
         * The layer to merge to.
         * @type {ol.layer.Vector}
         */
        targetLayer: null
    },

    initComponent: function() {
        var me = this;
        me.callParent();
        me.mergeLayers();
        me.registerMultiSelectFilter();
        var combos = me.query('combo');
        Ext.each(combos, function(combo) {
            combo.on('change', function() {
                me.registerMultiSelectFilter();
            });
        });
    },

    registerMultiSelectFilter: function() {
        var me = this;
        var store = this.down('multiselect').getStore();
        store.filterBy(function(rec) {
            var mappedFields = BasiGX.util.Merge.extractMappedFields(me);
            return mappedFields.indexOf(rec.data.field1) === -1;
        });
    },

    /**
     * Creates all the children.
     */
    mergeLayers: function() {
        var Merge = BasiGX.util.Merge;
        var sourceSchema = Merge.extractSchema(this.getSourceLayer());
        var targetSchema = Merge.extractSchema(this.getTargetLayer());

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
                allowBlank: true,
                forceSelection: true,
                editable: true
            });
        });

        this.createMergeWindow(labels, dropdowns, sourceSchema, targetSchema);
    },

    /**
     * Callback that actually merges the two layers.
     * @param  {Array} origSchema  the original target layer origSchema
     * @return {Function}             the callback
     */
    applyHandler: function(origSchema) {
        var me = this;
        var Merge = BasiGX.util.Merge;
        return function() {
            var win = this.up('window');
            var newFeatures = me.getSourceLayer().getSource().getFeatures();
            var target = me.getTargetLayer().getSource();
            var mapping = Merge.extractMapping(win);
            var copy = Merge.extractToCopyAttributes(win);

            Ext.each(newFeatures, function(feature) {
                var newFeature = Merge.convertFeature(feature, mapping, copy,
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
        this.up('window').close();
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
            minHeight: 100,
            width: '100%',
            bind: {
                fieldLabel: '{adoptAttributes}'
            },
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
     * @param  {Array} sourceSchema the source layer schema
     * @param  {Array} origSchema   the target layer schema
     */
    createMergeWindow: function(labels, dropdowns, sourceSchema, origSchema) {
        var vboxes = this.createDropdownList(labels, dropdowns);

        var buttons = {
            xtype: 'container',
            items: [{
                xtype: 'button',
                bind: {
                    text: '{applyText}'
                },
                margin: '2 5 2 2',
                handler: this.applyHandler(origSchema)
            }, {
                xtype: 'button',
                bind: {
                    text: '{cancelText}'
                },
                margin: '2 2 2 0',
                handler: this.cancelHandler
            }]
        };

        var attributeList = this.createAttributeSelection(sourceSchema);

        var panel = {
            xtype: 'form',
            layout: 'vbox',
            scrollable: true,
            width: 550,
            items: [{
                xtype: 'label',
                bind: {
                    text: '{matchText}'
                }
            }, {
                xtype: 'container',
                layout: {
                    type: 'table',
                    // The total column count must be specified here
                    columns: 3
                },
                items: vboxes
            },
            attributeList,
            {
                xtype: 'buttongroup',
                bodyBorder: false,
                frame: false,
                items: buttons
            }]
        };

        this.add(panel);
    }
});
