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
 * Mobile Window
 *
 * Used to show a window-like panel in the viewport.
 * Panel is hideable / closable.
 *
 * Usage Example:
 *
 * win = Ext.create('BasiGX.view.panel.MobileWindow', {
 *     title: 'Objektinformation',
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
Ext.define("BasiGX.view.panel.MobileWindow", {
    extend: "Ext.Panel",
    xtype: "basigx-panel-mobilewindow",

    requires: [
        'Ext.Container'
    ],

    config: {
        title: '',
        centered: true,
        scrollable: 'y',
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
     *
     */
    constructor: function(config) {
        var me = this;
        me.callParent([config]);

        var headerPanel = Ext.create('Ext.Container', {
            styleHtmlContent: true,
            html: '<b>' + me.getTitle() + '</b>' +
                '<i class="fa fa-times-circle-o fa-2x" ' +
                'style="position:absolute;right:10px;top:0px;" ' +
                'onclick="Ext.ComponentQuery.query(' +
                '\'basigx-panel-mobilewindow[name=' + me.getName() + ']\')' +
                '[0].hide();">' +
                '</i>',
            flex: 1
        });
        me.add(headerPanel);

        if (me.getAdditionalItems().length > 0) {
            me.add(me.getAdditionalItems());
        }
    }
});
