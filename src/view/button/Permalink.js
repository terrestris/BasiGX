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
 * AddWms Button
 *
 * Button used to instanciate the basigx-form-addwms in order to add a
 * WMS to the map
 *
 */
Ext.define("BasiGX.view.button.Permalink", {
    extend: "Ext.button.Button",
    xtype: 'basigx-button-permalink',

    requires: [
        'Ext.window.Window',
        'BasiGX.view.form.Permalink',
        'BasiGX.util.Animate',
        'BasiGX.util.Application'
    ],

    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    /**
    *
    */
   handler: function(){
       var win = Ext.ComponentQuery.query('[name=permalink-window]')[0];
       if(!win){
           Ext.create('Ext.window.Window', {
               name: 'permalink-window',
               title: 'Permalink',
               layout: 'fit',
               items: [{
                   xtype: 'basigx-form-permalink'
               }]
           }).show();
       } else {
           BasiGX.util.Animate.shake(win);
       }
   },

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Permalink',
            text: 'Permalink'
        }
    }
});
