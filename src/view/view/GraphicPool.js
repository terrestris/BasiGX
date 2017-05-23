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
 * BasiGX.view.view.GraphicPool
 *
 * Used to upload, select and delete graphics
 *
 * @class BasiGX.view.view.GraphicPool
 */
Ext.define('BasiGX.view.view.GraphicPool', {
    extend: 'Ext.view.View',
    xtype: 'basigx-view-graphicpool',

    requires: [
        'Ext.data.Store',
        'BasiGX.util.Url'
    ],

    viewModel: {
        data: {
            /**
             * text displayed when no pictures were found
             */
            emptyStoreMsg: 'No data found'
        }
    },

    /**
     *
     */
    border: false,

    /**
     * shall the dataview be scrollable
     */
    scrollable: true,

    /**
     * the default height of the dataview
     */
    height: '100%',

    /**
     * the default width of the dataview
     */
    width: '100%',

    /**
     * the default class
     */
    cls: 'graphic-pool-view',

    /**
     * readonly
     *
     * will be created on init
     */
    store: null,

    /**
     *
     */
    config: {
        /**
         * The url objects for images.
         * Can contain url and method property
         */
        backendUrls: null,

        /**
         *
         */
        itemSelector: 'div.thumb-wrap',

        /**
         * allow multiselect?
         */
        multiSelect: false,

        /**
         * use trackover?
         */
        trackOver: true
    },

    /**
     *
     */
    initComponent: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var emptyText = viewModel.get('emptyStoreMsg');
        me.emptyText = emptyText;

        var store = Ext.create('Ext.data.Store', {
            sorters: 'fileName',
//            TODO: add and make a model configurable?
            proxy: {
                type: 'ajax',
                url: BasiGX.util.Url.getWebProjectBaseUrl() +
                    me.getBackendUrls().pictureList.url,
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            }
        });
        store.load();

        var srcUrl = BasiGX.util.Url.getWebProjectBaseUrl() +
            me.getBackendUrls().pictureSrc.url;

        me.itemSelector = me.getItemSelector();
        me.store = store;

        me.tpl = [
            '<tpl for=".">',
            '<div class="thumb-wrap">',
            '<div class="thumb">',
            '<img src="' + srcUrl + '{id}"/>',
            '</div>',
            '<span>{fileName}</span>',
            '</div>',
            '</tpl>'
        ];

        // call super
        me.callParent(arguments);
    }
});
