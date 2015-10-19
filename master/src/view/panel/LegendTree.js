/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 * LegendTree Panel
 *
 * Used to build a TreePanel with layer legends.
 *
 */
Ext.define("BasiGX.view.panel.LegendTree", {
    extend: "GeoExt.tree.Panel",
    xtype: "basigx-panel-legendtree",

    requires: [
        'BasiGX.ux.RowExpanderWithComponents'
    ],

    viewModel: {
        data: {
        }
    },

    /**
     * adding custom method to get access to row styles
     */
    viewConfig: {
        getRowClass: function(record){
            return this.up().getCssForRow(record);
        }
    },

    layout: 'fit',

    width: 250,

    height: 300,

    collapsible: true,

    collapsed: true,

    hideCollapseTool: true,

    collapseDirection: 'bottom',

    titleCollapse: true,

    titleAlign: 'center',

    rootVisible: false,

    allowDeselect: true,

    selModel: {
        mode: 'MULTI'
    },

    cls: 'basigx-legend-panel',

    /**
     * @private
     */
    initiallyCollapsed: null,

    /**
     * Take care of the collapsed configuration.
     *
     * For some reason, for the legend panel we cannot have the configuration
     *
     *     {
     *         collapsed: true,
     *         hideCollapseTool: true
     *     }
     * because the the showing on header click does not work. We have this one
     * time listener, that tells us what we originally wanted.
     */
    initComponent: function() {
        var me = this;

        if (me.collapsed && me.hideCollapseTool) {
            me.collapsed = false;
            me.initiallyCollapsed = true;
            Ext.log.info('Ignoring configuration "collapsed" and instead' +
                    ' setup a one-time afterlayout listener that will' +
                    ' collapse the panel (this is possibly due to a bug in' +
                    ' ExtJS 6)');
        }
        me.hideHeaders = true;

        me.lines = false;
        me.plugins = [{
            ptype: 'rowexpanderwithcomponents',
            hideExpandColumn: true,
            rowBodyCompTemplate: me.rowBodyCompTemplate
        }];

        // call parent
        me.callParent();

        // See the comment above the constructor why we need this.
        if (me.initiallyCollapsed){
            me.on('afterlayout', function(){
                this.collapse();
            }, me, {single: true, delay: 100});
            me.initiallyCollapsed = null;
        }
    },

    /**
     * This template will be used for every record. It can contain general
     * Ext JS Components. Text in "{{ }}" will be executed as JavaScript.
     */
    rowBodyCompTemplate: {
        xtype: 'container',
        items: [{
            xtype: 'image',
            src: '{{record.getOlLayer().get("legendUrl")}}',
            height: '{{record.getOlLayer().get("legendHeight")}}',
            alt: '{{record.getOlLayer().get("legendUrl")}}'
        }]
    },

    /**
     * Expands All RowBodies
     */
    expandAllBodies: function(){
        var me = this;
        if((!me.getBodyInitiallyCollapsed()) && me.plugins.length > 0){
            me.getStore().each(function(record, index) {
                me.plugins[0].toggleRow(index, record);
            });
        }
    },

    /**
     *
     */
    getColorFromRow: function(rec){
        var me = this;
        var color = rec.getData().get('treeColor');

        // detect if we have a folder and apply color from childNode
        if (!Ext.isDefined(color) &&
            !rec.isLeaf() &&
            rec.childNodes.length > 0) {
                Ext.each(rec.childNodes, function(child) {
                    color = me.getColorFromRow(child);
                    if (Ext.isDefined(color)) {
                        return false;
                    }
                });
        }
        return color;
    },

    /**
     * Method gives access to the rows style.
     * If a layer is configured with property 'treeColor', the color will
     * get applied here. Folders will inherit the color
     */
    getCssForRow: function(rec) {

          var color = this.getColorFromRow(rec);

        // if color is still not defined, return old default
        if (!Ext.isDefined(color)) {
            return "my-body-class";
        }

        var elemenIdAndCssClass;
        if (color === null) {
            elemenIdAndCssClass = 'stylesheet-null';
        } else {
            elemenIdAndCssClass = 'stylesheet-' +
                color.replace(/[\(\),\. ]+/g, '-');
        }

        var sheet = Ext.DomQuery.selectNode('#' + elemenIdAndCssClass);
        if (sheet) {
            // already create once before
            return elemenIdAndCssClass;
            // instead of returning, we could also remove the sheet and add it
            // again: see below
            // sheet.parentNode.removeChild(sheet);
        } else {
            var css = '' +
                '.' + elemenIdAndCssClass + ' { ' +
                ' background-color: ' + color + ';' +
                ' background:linear-gradient(to right, white, ' + color + ');' +
                '}';
            Ext.util.CSS.createStyleSheet(css, elemenIdAndCssClass);

            return elemenIdAndCssClass;
        }
    }
});
