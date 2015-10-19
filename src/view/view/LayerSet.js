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
 * LayerSet View
 *
 * Used in the LayerSetChooser Panel
 *
 */
Ext.define("BasiGX.view.view.LayerSet", {
    extend: "Ext.view.View",
    xtype: "basigx-view-layerset",

    requires: [
        "Ext.data.Store"
    ],

    /**
     * the url to request the layerset json-file.
     * If this is null, a demo set will be shown
     */
    layerSetUrl: null,

    /**
     * the default path to request the images from
     */
    defaultImagePath: 'classic/resources/img/themes/',

    /**
     * the demo image to use
     */
    demoThumb: 'https://www.terrestris.de/wp-content/uploads/2014/03/' +
        'logo_terrestris_small3.png',

    /**
     *
     */
    width: 400,

    /**
     *
     */
    height: 300,

    /**
     *
     */
    singleSelect: true,

    /**
     *
     */
    cls: 'img-chooser-view',

    /**
     *
     */
    overItemCls: 'x-view-over',

    /**
     *
     */
    itemSelector: 'div.thumb-wrap',

    /**
     *
     */
    tpl: null,

    /**
     *
     */
    initComponent: function() {

        var me = this,
            store;

        if (Ext.isEmpty(me.layerSetUrl)) {
            // setup demo content
            store = Ext.create('Ext.data.Store', {
                fields: ['name', 'thumb', 'url', 'type'],
                sorters: 'type',
                data: [
                    {
                        "title": "Stadtkarte",
                        "name": "stadtkarte",
                        "thumb": me.demoThumb
                    },
                    {
                        "title": "Verkehr",
                        "name": "verkehr",
                        "thumb": me.demoThumb
                    },
                    {
                        "title": "Umwelt",
                        "name": "umwelt",
                        "thumb": me.demoThumb
                    }
                ]
            });

        } else {
            store = Ext.create('Ext.data.Store', {
                autoLoad: true,
                fields: ['name', 'title', 'thumb'],
                remoteSort: false,
                sorters: 'type',
                proxy: {
                    type: 'ajax',
                    url: me.layerSetUrl,
                    reader: {
                        type: 'json'
                    }
                }
            });
        }

        // setup default template if none given
        if (Ext.isEmpty(me.tpl)) {
            me.tpl = [
                 '<tpl for=".">',
                     '<div class="thumb-wrap">',
                         '<div class="thumb">',
                             // if the thumb is a href to an online resource, we
                             // dont need the defaultImagePath
                             '<tpl if="thumb.indexOf(\'http\') &gt;= 0">',
                                 '<img src="{thumb}" />',
                             '<tpl else>',
                                 '<img src="' + me.defaultImagePath,
                                 '{thumb}" />',
                             '</tpl>',
                         '</div>',
                         '<span>{title}</span>',
                     '</div>',
                 '</tpl>'
             ];
        }

        // setup store
        me.store = store;

        this.callParent(arguments);
    }
});
