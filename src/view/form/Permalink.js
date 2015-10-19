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
 * Permalink FormPanel
 *
 * Used to show a permalink of the mapstate (center, zoom, visible layers)
 *
 */
Ext.define("BasiGX.view.form.Permalink", {
    extend: "Ext.form.Panel",

    xtype: 'basigx-form-permalink',

    requires: [
        'Ext.button.Button'
    ],

    viewModel: {
        data: {
            permalink: 'Permalink'
        }
    },

    padding: 5,
    layout: 'fit',
    minWidth: 320,
    defaults: {
        anchor: '100%'
    },

    items: [{
        xtype: 'textfield',
        name: 'textfield-permalink',
        editable: false,
        listeners: {
            afterrender: function(textfield){
                var permalink = textfield.up('form').getPermalink();
                textfield.setValue(permalink);
            },
            change: function(textfield){
                var width = Ext.util.TextMetrics.measure(
                    textfield.getEl(), textfield.getValue()).width;
                textfield.setWidth(width + 20);
            }
        }
    }],

    buttons: [{
        text: 'Erneuern',
        handler: function(btn){
            var permalink = btn.up('form').getPermalink();
            var textfield = btn.up('form').down('textfield');
            textfield.setValue(permalink);
        }
    }],

    getPermalink: function(){
        var route = BasiGX.util.Application.getRoute();
        var hrefWithoutHash = window.location.origin +
            window.location.pathname +
            window.location.search;
        var permalink = hrefWithoutHash + '#' + route;
        return permalink;
    }

});
