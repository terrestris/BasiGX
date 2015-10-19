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
 * CoordinateTransform Button
 *
 * Button used to instanciate the basigx-form-CoordinateTransform in order
 * to show and transform coordinates
 *
 */
Ext.define("BasiGX.view.button.CoordinateTransform", {
    extend: "Ext.button.Button",
    xtype: 'basigx-button-coordinatetransform',

    requires: [
        'Ext.window.Window',
        'BasiGX.view.form.CoordinateTransform',
        'BasiGX.util.Animate'
    ],

    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    /**
     * Array of CRS in EPSG notation that should be used
     */
    coordinateSystemsToUse: [],

    /**
     *
     */
    transformCenterOnRender: true,

    /**
    *
    */
   handler: function(){
       var win = Ext.ComponentQuery.query('[name=coordinate-transform-window]')[0];
       if(!win){
           Ext.create('Ext.window.Window', {
               name: 'coordinate-transform-window',
               title: 'Koordinaten transformieren',
               width: 500,
               height: 400,
               layout: 'fit',
               items: [{
                   xtype: 'basigx-form-coordinatetransform',
                   coordinateSystemsToUse: this.coordinateSystemsToUse,
                   transformCenterOnRender: this.transformCenterOnRender
               }]
           }).showAt(0);
       } else {
           BasiGX.util.Animate.shake(win);
       }
   },

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Koordinaten transformieren und anzeigen',
            text: 'Koordinaten transformieren'
        }
    }
});
