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
 * @class BasiGX.view.button.AddWms
 */
Ext.define("BasiGX.view.button.AddWms", {
    extend: "Ext.Button",
    xtype: 'basigx-button-addwms',

    requires: [
        'Ext.window.Window',
        'Ext.app.ViewModel',
        'BasiGX.view.form.AddWms',
        'BasiGX.util.Animate'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'WMS hinzufügen',
            text: 'WMS <span style="font-size: 1.7em; ' +
                'font-weight: normal;">⊕</span>',
            windowTitle: 'WMS hinzufügen'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     *
     */
    config: {
        windowConfig: {
            // can be used by subclasses to apply/merge
            // additional/other values for the window
        },
        handler: function(){
            var win = Ext.ComponentQuery.query('[name=add-wms-window]')[0];
            if(!win){

                var windowConfig = {
                    name: 'add-wms-window',
                    title: this.getViewModel().get('windowTitle'),
                    width: 500,
                    height: 400,
                    layout: 'fit',
                    items: [{
                        xtype: 'basigx-form-addwms'
                    }]
                };

                var windowConfigToApply = this.getConfig('windowConfig');
                Ext.apply(windowConfig, windowConfigToApply);

                Ext.create('Ext.window.Window', windowConfig).show();
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
