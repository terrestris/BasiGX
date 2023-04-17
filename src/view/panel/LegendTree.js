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
 * LegendTree Panel
 *
 * Used to build a TreePanel with layer legends.
 *
 * @class BasiGX.view.panel.LegendTree
 */
Ext.define('BasiGX.view.panel.LegendTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'basigx-panel-legendtree',

    requires: [
        'BasiGX.ux.RowExpanderWithComponents',
        'Ext.app.ViewModel'
    ],

    viewModel: {
        data: {
            documentation: '<h2>Themen Auswahl mit Legenden</h2>• In diesem ' +
                'Fenster können Sie die verfügbaren Kartenthemen sehen und ' +
                'deren Sichtbarkeit steuern. Ausserdem haben Sie die ' +
                'Möglichkeit, sich die Legenden zu den einzelnen Themen ' +
                'anzeigen zu lassen'
        }
    },

    /**
     * adding custom method to get access to row styles
     */
    viewConfig: {
        plugins: {ptype: 'treeviewdragdrop'},
        getRowClass: function(record) {
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

        this.addListener('collapse', this.onCollapse.bind(this));
        this.addListener('expand', this.onExpand.bind(this));

        // The following fix is needed for ExtJS versions between 6.0.0 and
        // 6.2.0 only. We keep it for backwards compatibility.
        if (me.isExtVersionLowerThan62()) {
            if (me.collapsed && me.hideCollapseTool) {
                me.collapsed = false;
                me.initiallyCollapsed = true;
                Ext.log.info('Ignoring configuration "collapsed" and instead' +
                        ' setup a one-time afterlayout listener that will' +
                        ' collapse the panel (this is possibly due to a bug' +
                        ' in ExtJS 6)');
            }
        }
        me.hideHeaders = true;

        me.lines = false;
        me.plugins = [{
            ptype: 'rowexpanderwithcomponents',
            hideExpandColumn: true,
            rowBodyCompTemplate: me.rowBodyCompTemplate,
            pluginId: 'rowexpanderwithcomponents'
        }];

        // call parent
        me.callParent();

        // The following fix is needed for ExtJS versions between 6.0.0 and
        // 6.2.0 only. We keep it for backwards compatibility.
        if (me.isExtVersionLowerThan62()) {
            // See the comment above the constructor why we need this.
            if (me.initiallyCollapsed) {
                me.on('afterlayout', function() {
                    this.collapse();
                }, me, {single: true, delay: 100});
                me.initiallyCollapsed = null;
            }
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
     * Expands, collapses or toggles all row bodies with the components,
     * depending on the passed mode.
     *
     * @param {String} mode The mode to set; either `toggle`, `expand` or
     *     `collapse`.
     * @protected
     */
    setModeAllBodies: function(mode) {
        var toggle = mode === 'toggle';
        var expand = mode === 'expand';
        var collapse = mode === 'collapse';
        if (!toggle && !expand && !collapse) {
            Ext.log.warn('Illegal mode, expected "' + mode + '"' +
                ' to be bei either "toggle", "expand" or "collapse".');
            return;
        }
        var me = this;
        var plugin = me.getPlugin('rowexpanderwithcomponents');
        var collapsedClass = me.plugins[0].rowCollapsedCls;

        if (me.initiallyCollapsed) {
            Ext.log.warn('Cannot set mode of all bodies, the view is still ' +
                'collapsed');
            return;
        }
        if (!plugin) {
            Ext.log.warn('Cannot set mode of all bodies, Failed to determine ' +
                'the row expander-plugin');
            return;
        }

        var store = me.getStore();
        store.each(function(record, index) {
            if (toggle) {
                plugin.toggleRow(index, record);
            } else {
                var rowNode = me.view.getNode(index);
                var normalRow = Ext.fly(rowNode);
                var currentlyCollapsed = normalRow.hasCls(collapsedClass);
                if (currentlyCollapsed && expand) {
                    plugin.toggleRow(index, record);
                } else if (!currentlyCollapsed && collapse) {
                    plugin.toggleRow(index, record);
                }
            }
        });
    },

    /**
     * Expands all row bodies with the components, effectively showing
     * previously hidden legends.
     */
    expandAllBodies: function() {
        this.setModeAllBodies('expand');
    },

    /**
     * Collapses all row bodies with the components, effectively hiding
     * previously shown legends.
     */
    collapseAllBodies: function() {
        this.setModeAllBodies('collapse');
    },

    /**
     * Toggles all row bodies with the components, effectively showing
     * previously hidden legends and hiding previously shown legends.
     */
    toggleAllBodies: function() {
        this.setModeAllBodies('toggle');
    },

    /**
     * Recursively searches the passed record (or its children) for a
     * `treeColor` field and eventually returns the found color.
     *
     * @param {Ext.data.Model} rec A tree node record to search the color in.
     * @return {String} A color value.
     */
    getColorFromRow: function(rec) {
        var me = this;
        var recData = rec.getData();
        var color;
        if (Ext.isFunction(recData.get)) {
            color = recData.get('treeColor');
        } else if (recData.treeColor) {
            color = recData.treeColor;
        } else if (Ext.isFunction(rec.getOlLayer) &&
            Ext.isFunction(rec.getOlLayer().get)) {
            color = rec.getOlLayer().get('treeColor');
        }

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
     *
     * If a layer is configured with property 'treeColor', the color will
     * get applied here. Folders will inherit the color
     *
     * @param {Ext.data.Model} rec The tree node record of the row.
     * @return {String} A CSS class to use.
     */
    getCssForRow: function(rec) {
        var color = this.getColorFromRow(rec);

        // if color is still not defined, return old default
        if (!Ext.isDefined(color)) {
            return 'my-body-class';
        }

        var elemenIdAndCssClass;
        if (color === null) {
            elemenIdAndCssClass = 'stylesheet-null';
        } else {
            elemenIdAndCssClass = 'stylesheet-' +
                color.replace(/[(),. ]+/g, '-');
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
                ' filter: alpha(opacity=50);' + // IE9 fallback
                '}';
            Ext.util.CSS.createStyleSheet(css, elemenIdAndCssClass);

            return elemenIdAndCssClass;
        }
    },

    /**
     * Tests if the current ExtJS version is lower than 6.2.0.000.
     *
     * @return {Boolean} Whether the version is lower than 6.2.0.000 or not.
     */
    isExtVersionLowerThan62: function() {
        return parseInt(Ext.getVersion().getShortVersion(), 10) < 620000;
    },
    /**
     * The handler for the beforedestroy event.
     */
    onCollapse: function() {
        window.setTimeout(function () {
            // Update the map size when collapsing the legendTree
            var map = BasiGX.util.Map.getMapComponent().map;
            map.updateSize();
        }, 100);
    },
    onExpand: function() {
        window.setTimeout(function () {
            // Update the map size when expanding the legendTree
            var map = BasiGX.util.Map.getMapComponent().map;
            map.updateSize();
        }, 100);
    }
});
