/*eslint no-eval:1*/ // turn eval usage into a warning when linting
/* Copyright (c) 2015-present terrestris GmbH & Co. KG
 * Copyright (c) 2015-present David French
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
 * RowExpanderWithComponents plugin
 *
 * This an ux originally created for ExtJS 4.2.2 by David French under MIT
 * License.
 *
 * Modified by terrestris to fit the needs of ExtJS 6.
 * https://github.com/davidffrench/Ext.ux.RowExpanderWithComponents
 *
 * @class BasiGX.ux.RowExpanderWithComponents
 */
Ext.define('BasiGX.ux.RowExpanderWithComponents', {
    extend: 'Ext.grid.plugin.RowExpander',
    alias: 'plugin.rowexpanderwithcomponents',
    pluginId: 'rowexpanderwithcomponents',

    /**
     * @cfg {XTemplate} rowBodyTpl
     * This needs to default to the below for ExtJS components to render to the
     * correct row (defaults to <tt><div id="display-row-{id}"> </div></tt>).
     */
    rowBodyTpl: new Ext.XTemplate(
        '<div id="display-row-{id}"> </div>'
    ),

    /**
     * @cfg {Object} rowBodyCompTemplate
     * This template will be used for every record. It can contain general
     * Ext JS Components. Text in `{{ }}` will be executed as JavaScript.
     * Sample below
     *
     *     rowBodyCompTemplate: {
     *       xtype: 'container',
     *       items: [{
     *         xtype: 'image',
     *         src: '{{record.getOlLayer().get("legendUrl")}}',
     *         height: '{{record.getOlLayer().get("legendHeight")}}',
     *         alt: '{{record.getOlLayer().get("legendUrl")}}'
     *       }]
     *     }
     *
     * Defaults to <tt>null</tt>
     */
    rowBodyCompTemplate: null,

    /**
     * @cfg {Boolean} expandOnClick
     * <tt>true</tt> to toggle a row between expanded/collapsed when single
     * clicked (defaults to <tt>true</tt>).
     */
    expandOnClick: false,

    /**
     * @cfg {Boolean} hideExpandColumn
     * <tt>true</tt> to hide the column that contains the expand/collapse icons
     * (defaults to <tt>true</tt>).
     */
    hideExpandColumn: false,

    /**
     * @cfg {Boolean} enableTextSelection
     * <tt>true</tt> to enable text selection within the grid
     * (defaults to <tt>true</tt>).
     */
    enableTextSelection: true,

    preventRecursionArray: [],

    init: function(grid) {
        var me = this;
        var view;

        me.callParent(arguments);

        //get the grids view
        view = me.view = grid.getView();

        //this css does not highlight the row expander body
        grid.addCls('rowexpanderwithcomponents');

        // set the rowexpander column to hidden if hideExpandColumn config is
        // true
        if (me.hideExpandColumn) {
            grid.headerCt.query('gridcolumn')[0].hidden = true;
        }
        // enable text selection if the config is true
        if (me.enableTextSelection) {
            view.enableTextSelection = true;
        }

        view.on('expandbody', function(rowNode, record) {
            var recId = record.getId();
            if (!recId) {
                Ext.Error.raise('Error: Records must have an id to use the' +
                    'rowExpanderWithComponents plugin. ' +
                    'Use http://docs.sencha.com/extjs/4.2.2/#!/api/Ext.data.' +
                    'Model-cfg-idProperty or http://docs.sencha.com/extjs/' +
                    '4.2.2/#!/api/Ext.data.Model-cfg-idgen');
            }

            var row = 'display-row-' + recId;
            var clonedRowTemplate = Ext.clone(me.rowBodyCompTemplate);

            // TODO The rowbody behaviour seems to be not that smooth. We
            // should have a look at this
            // if the row got children dont add it again
            if (Ext.get(row).dom.children.length === 0) {
                var parentCont = Ext.create(Ext.container.Container, {
                    height: '100%',
                    width: '100%',
                    itemId: grid.getId() + '-parentRowExpCont-' + recId,
                    items: [
                        me.replaceObjValues(clonedRowTemplate, record)
                    ]
                });
                //render the ExtJS component to the div
                parentCont.render(row);

                //Stop all events in the row body from bubbling up
                var rowEl = parentCont.getEl().parent('.x-grid-rowbody');
                rowEl.swallowEvent(['mouseenter', 'click', 'mouseover',
                    'mousedown', 'dblclick', 'cellclick', 'itemmouseenter',
                    'itemmouseleave', 'onRowFocus', 'mouseleave']);

                // adding the dynamic css to component
                var rowToStyle = parentCont.getEl().parent(
                    '.x-grid-rowbody-tr'
                );
                rowToStyle.addCls(grid.getCssForRow(record));
            }

        });
        //assign the helper functions to the gridview and grid
        view.getRowComponent = me.getRowComponent;
        grid.getRowComponent = me.getRowComponent;

        grid.addToRowComponent = me.addToRowComponent;
        grid.addToRowComponent = me.addToRowComponent;
    },

    /**
     * Gets the parent ExtJS container in the rowexpander body from the rows
     * record id.
     *
     * @param {Number} recId The row record id.
     * @return {Ext.container.Container} The parent ExtJS container in the
     *     rowexpander body
     */
    getRowComponent: function(recId) {
        return Ext.ComponentQuery.query(
            '#' + this.up('treepanel').getId() + '-parentRowExpCont-' + recId
        )[0];
    },

    /**
     * Removes all ExtJS items from the parent row component.
     *
     * @param {Number} recId The row record id.
     */
    removeAllFromRowComponent: function(recId) {
        var rowCont = this.getRowComponent(recId);

        rowCont.removeAll();
    },

    /**
     * Adds items to the parent ExtJS container in the rowexpander body
     * @param {integer} recId The row record id
     * @param {Array} items ExtJS components
     */
    addToRowComponent: function(recId, items) {
        var rowCont = this.getRowComponent(recId);

        rowCont.add(items);
    },

    /**
     * Allow single click to expand grid
     *
     * @param {Ext.view.Table} view The grid view.
     * @private
     */
    bindView: function(view) {
        if (this.expandOnClick) {
            view.on('itemclick', this.onItemClick, this);
        }
        this.callParent(arguments);
    },

    /**
     * Allow single click to expand grid.
     *
     * @param {Ext.view.Table} view The grid view.
     * @param {Ext.data.Model} record The record that belongs to the item.
     * @param {HTMLElement} row The item's element.
     * @param {Number} rowIdx The item's index.
     * @private
     */
    onItemClick: function(view, record, row, rowIdx) {
        this.toggleRow(rowIdx, record);
    },

    /**
     * Converts all string values with {{}} to code
     * Example: '{{record.get('test'}}' converts to record.get('test')
     *
     * @param {Object} obj The object in which code in values might be
     *     evaluated. Will be checked recursively.
     * @param {Ext.data.Model} record The record used for replacing.
     * @return {Object} The passed object in which replacements might have
     *     occured.
     * @private
     */
    replaceObjValues: function(obj, record) {

        for (var all in obj) {
            if (typeof obj[all] === 'string' && obj[all].match(/{{(.*)}}/)) {
                /* eslint no-eval:0 */
                obj[all] = eval(obj[all].match(/{{(.*)}}/)[1]);
            }
            if (typeof obj[all] === 'object' && obj[all] !== null) {
                if (Ext.Array.contains(this.preventRecursionArray, obj[all])) {
                    return obj;
                } else {
                    this.preventRecursionArray.push(obj[all]);
                    this.replaceObjValues(obj[all], record);
                }
            }
            if (obj.xtype) {
                obj.layerRec = record;
                // if we do not have a cluster layer, we remove the "double
                // symbology / legend"
                if (record.getOlLayer() && record.getOlLayer().get('type') &&
                    record.getOlLayer().get('type') !== 'WFSCluster' &&
                    Ext.isArray(obj.items) && obj.items.length > 1) {
                    var lastItem = obj.items[obj.items.length - 1];
                    if (lastItem.xtype === 'image') {
                        obj.items.pop();
                    }
                }
            }
        }

        return obj;
    }
});
