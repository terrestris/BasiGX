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
 * Permalink Button
 *
 * Button used to open a permalink window.
 *
 * @class BasiGX.view.button.Permalink
 */
Ext.define("BasiGX.view.button.Permalink", {
    extend: "Ext.Button",
    xtype: 'basigx-button-permalink',

    requires: [
        'Ext.window.Window',
        'Ext.app.ViewModel',
        'BasiGX.view.form.Permalink',
        'BasiGX.util.Animate',
        'BasiGX.util.Application'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Permalink erzeugen',
            text: 'Permalink',
            windowTitle: 'Link zur Anwendung'
        }
    },

    bind: {
        text: '{text}'
    },

    config: {
        handler: function(){
            var win = Ext.ComponentQuery.query('[name=permalink-window]')[0];
            if(!win){
                Ext.create('Ext.window.Window', {
                    name: 'permalink-window',
                    title: this.getViewModel().get('windowTitle'),
                    layout: 'fit',
                    items: [{
                        xtype: 'basigx-form-permalink'
                    }]
                }).show();
            } else {
                BasiGX.util.Animate.shake(win);
            }
        }
    },

    /**
     *
     */
    constructor: function(config) {
        this.callParent([config]);

        if (this.setTooltip) {
            var bind = this.config.bind;
            bind.tooltip = this.getViewModel().get('tooltip');
            this.setBind(bind);
        }
    }
});
