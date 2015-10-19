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
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 */
Ext.define("BasiGX.view.button.Help", {
    extend: "Ext.button.Button",
    xtype: 'basigx-button-help',

    requires: [
        'BasiGX.ux.ContextSensitiveHelp'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Hilfe',
            text: null
        }
    },

    bind: {
        text: '{text}',
        tooltip: '{tooltip}'
    },

    glyph: 'xf059@FontAwesome',

    config: {
        additonalHelpKeys: null
    },

    /**
    *
    */
   handler: function(button){
       var help = Ext.create('BasiGX.ux.ContextSensitiveHelp');
       help.setContextHelp(button.getAdditonalHelpKeys());
   }

});
