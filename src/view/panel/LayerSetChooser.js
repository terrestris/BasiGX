/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * LayerSetChooser Panel
 *
 * Used to show different sets of layers to swap the thematic focus of the
 * application, e.g. by changing the visibility of layers.
 * The events fired ('itemclick' and 'itemdblclick') will hand over the
 * selected record
 *
 * Example:
 *
 *     {
 *         xtype: 'basigx-panel-layersetchooser',
 *         layerSetUrl: 'classic/resources/layerset.json',
 *         listeners: {
 *             itemclick: this.handleLayerSetClick
 *         }
 *     }
 *
 * @class BasiGX.view.panel.LayerSetChooser
 */
Ext.define('BasiGX.view.panel.LayerSetChooser', {
    extend: 'Ext.panel.Panel',
    xtype: 'basigx-panel-layersetchooser',

    requires: [
        'BasiGX.view.view.LayerSet',
        'Ext.app.ViewModel'
    ],

    viewModel: {
        data: {
            title: 'Themen Auswahl',
            filterFieldLabel: 'Filter'
        }
    },

    bind: {
        title: '{title}'
    },

    /**
     *
     */
    region: 'center',

    /**
     *
     */
    layout: 'fit',

    /**
     *
     */
    minWidth: 150,

    /**
     *
     */
    minHeight: 170,

    /**
     *
     */
    cls: 'img-chooser-dlg',

    /**
     *
     */
    layerSetUrl: null,

    /**
     * JSON-object to be passed to the automatically created
     * 'basigx-view-layerset'.
     * Only has an effect if this.items is empty.
     */
    layerSetData: null,

    /**
     *
     */
    tpl: null,

    /**
     *
     */
    scrollable: 'y',

    /**
     *
     */
    bbar: [
        {
            xtype: 'textfield',
            name: 'filter',
            bind: {
                fieldLabel: '{filterFieldLabel}'
            },
            labelAlign: 'left',
            labelWidth: 45,
            flex: 1
        }
    ],

    /**
     *
     */
    initComponent: function() {

        if (Ext.isEmpty(this.items)) {

            this.items = [{
                xtype: 'basigx-view-layerset',
                scrollable: true,
                layerSetUrl: this.layerSetUrl,
                layerSetData: this.layerSetData,
                tpl: this.tpl
            }];
        }

        this.callParent(arguments);

        // add listeners
        this.down('basigx-view-layerset').on(
            'select', this.onLayerSetSelect);
        this.down('basigx-view-layerset').on(
            'selectionchange', this.onLayerSetSelectionchange);
        this.down('basigx-view-layerset').on(
            'itemclick', this.onLayerSetClick);
        this.down('basigx-view-layerset').on(
            'itemdblclick', this.onLayerSetDblClick);
    },


    /**
     * Just firing an event on the panel.
     *
     * Listen to the select event to implement custom handling.
     *
     * @param {Ext.selection.DataViewModel} view The selection model.
     * @param {Ext.data.Model} rec The selected record (layerset).
     * @param {Number} index The index within the store of the selected record.
     * @param {Object} opts The options object passed when the event handler
     *     was registered.
     */
    onLayerSetSelect: function(view, rec, index, opts) {
        this.up('basigx-panel-layersetchooser').fireEvent(
            'select', view, rec, index, opts);
    },

    /**
     * Just firing an event on the panel.
     *
     * Listen to the select event to implement custom handling
     *
     * @param {Ext.selection.DataViewModel} view The selection model.
     * @param {Array<Ext.data.Model>} selected The selected records (layersets).
     * @param {Object} eOpts The options object passed when the event handler
     *     was registered.
     */
    onLayerSetSelectionchange: function(view, selected, eOpts) {
        this.up('basigx-panel-layersetchooser').fireEvent(
            'selectionchange', view, selected, eOpts);
    },

    /**
     * Just firing an event on the panel.
     *
     * Listen to the itemclick event to implement custom handling
     *
     * @param {BasiGX.view.view.LayerSet} view The LayerSet view.
     * @param {Ext.data.Model} rec The clicked record (layerset).
     * @param {HTMLElement} item The item's element.
     * @param {Number} index The item's index.
     * @param {Object} evt The raw event object.
     * @param {Object} opts The options object passed when the event handler
     *     was registered.
     */
    onLayerSetClick: function(view, rec, item, index, evt, opts) {
        view.up('basigx-panel-layersetchooser').fireEvent(
            'itemclick', view, rec, item, index, evt, opts);
    },

    /**
     * Just firing an event on the panel.
     *
     * Listen to the itemdblclick event to implement custom handling.
     *
     * @param {BasiGX.view.view.LayerSet} view The LayerSet view.
     * @param {Ext.data.Model} rec The double-clicked record (layerset).
     * @param {HTMLElement} item The item's element.
     * @param {Number} index The item's index.
     * @param {Object} evt The raw event object.
     * @param {Object} opts The options object passed when the event handler
     *     was registered.
     */
    onLayerSetDblClick: function(view, rec, item, index, evt, opts) {
        view.up('basigx-panel-layersetchooser').fireEvent(
            'itemdblclick', view, rec, item, index, evt, opts);
    },

    /**
     * Can be used to filter the layer sets by text, usually bound as
     * eventhandler of the `change` event of a textfield.
     *
     * @param {Ext.form.field.Text} textfield The textfield.
     * @param {String} newVal The new value.
     * @param {String} oldval The old value.
     * @param {Ext.form.field.Text} listener The options object passed to
     *     `Ext.util.Observable.addListener`.
     */
    filterLayerSetsByText: function(textfield, newVal, oldval, listener) {
        var layerProfileView = listener.scope.down('basigx-view-layerset');
        var store = layerProfileView.getStore();
        store.getFilters().replaceAll({
            property: 'name',
            anyMatch: true,
            value: newVal
        });
    }
});
