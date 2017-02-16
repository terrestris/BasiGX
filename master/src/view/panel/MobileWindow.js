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
 * Mobile Window
 *
 * Used to show a window-like panel in the viewport.
 * Panel is hideable / closable.
 *
 * Usage Example:
 *
 * win = Ext.create('BasiGX.view.panel.MobileWindow', {
 *     panelTitle: 'Objektinformation',
 *     name: 'hsi-panel',
 *     additionalItems: [
 *         {
 *             xtype: 'tabpanel',
 *             items: tabArray,
 *             flex: 7
 *         }
 *     ]
 * };
 * viewport.add(win);
 * win.show();
 *
 * @class BasiGX.view.panel.MobileWindow
 */
Ext.define('BasiGX.view.panel.MobileWindow', {
    extend: 'Ext.Panel',
    xtype: 'basigx-panel-mobilewindow',

    requires: [
        'Ext.Container'
    ],

    config: {
        panelTitle: '',
        scrollable: true,
        centered: true,
        minWidth: '50%',
        maxWidth: '80%',
        minHeight: '50%',
        maxHeight: '80%',
        width: 200,
        height: 200,
        padding: '10 10 10 10',
        layout: 'vbox',
        name: '',
        additionalItems: []
    },

    /**
     * The constructor for the MobileWindow class.
     *
     * @param {Object} config The configuration options for the MobileWindow.
     */
    constructor: function(config) {
        var me = this;
        me.callParent([config]);

        var headerPanel = Ext.create('Ext.Container', {
            styleHtmlContent: true,
            padding: '10 10 10 10',
            html: '<b>' + me.getPanelTitle() + '</b>' +
                '<i class="fa fa-times-circle-o fa-2x" ' +
                'style="position:absolute;right:10px;top:5px;" ' +
                'onclick="Ext.ComponentQuery.query(' +
                '\'basigx-panel-mobilewindow[name=' + me.getName() + ']\')' +
                '[0].hide();">' +
                '</i>',
            height: 40,
            docked: 'top',
            style: {
                'background-color': 'white'
            }
        });
        me.add(headerPanel);

        if (me.getAdditionalItems().length > 0) {
            me.add({
                xtype: 'panel',
                layout: 'vbox',
                items: me.getAdditionalItems()
            });
        }
    }
});
