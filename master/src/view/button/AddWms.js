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
 * AddWms Button
 *
 * Button used to instanciate the basigx-form-addwms in order to add a
 * WMS to the map
 *
 * @class BasiGX.view.button.AddWms
 */
Ext.define('BasiGX.view.button.AddWms', {
    extend: 'BasiGX.view.button.Base',
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
            windowTitle: 'WMS hinzufügen',
            documentation: '<h2>WMS hinzufügen</h2>• Ein Klick auf den ' +
                'Button öffnet ein Fenster, in dem Sie mit Hilfe einer ' +
                'WMS-URL einen beliebigen Kartendienst der Karte hinzufügen ' +
                'können.'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * A config object to show this tool in action (live demo) when using the
     * context sensitive help
     */
    liveDemoConfig: [
        {
            moveMouseTo: {
                component: 'basigx-button-addwms',
                moveDuration: 2000
            }
        },
        {
            clickOnButton: 'basigx-button-addwms'
        },
        {
            moveMouseTo: {
                component: 'window[name=add-wms-window] textfield[name=url]',
                moveDuration: 2000
            }
        },
        {
            enterText: {
                component: 'window[name=add-wms-window] textfield[name=url]',
                text: 'https://ows.terrestris.de/osm/service',
                waitAfter: 3500
            }
        },
        {
            moveMouseTo:
                'window[name=add-wms-window] button[name=requestLayersBtn]'
        },
        {
            clickOnButton: {
                component:
                    'window[name=add-wms-window] button[name=requestLayersBtn]',
                waitAfter: 3000
            }
        },
        {
            scrollTo: {
                component: 'window[name=add-wms-window] form',
                target: {
                    x: 0,
                    y: 999,
                    animate: true
                }
            }
        },
        {
            moveMouseTo:
                'window[name=add-wms-window] button[name=add-checked-layers]'
        },
        {
            destroy: 'window[name=add-wms-window]'
        }
    ],

    /**
     * The window instance which will be created by this button.
     *
     * @type {Ext.window.Window}
     * @private
     */
    _win: null,

    /**
     *
     */
    config: {
        windowConfig: {
            // can be used by subclasses to apply/merge
            // additional/other values for the window
        }
    },

    handler: function() {
        if (!this._win) {
            var windowConfig = {
                name: 'add-wms-window',
                title: this.getViewModel().get('windowTitle'),
                width: 500,
                height: 400,
                layout: 'fit',
                constrain: true,
                items: [{
                    xtype: 'basigx-form-addwms'
                }],
                listeners: {
                    destroy: this.onDestroy,
                    scope: this
                }
            };

            var windowConfigToApply = this.getWindowConfig();
            Ext.apply(windowConfig, windowConfigToApply);

            this._win = Ext.create('Ext.window.Window', windowConfig);
            this._win.show();
        } else {
            BasiGX.util.Animate.shake(this._win);
        }
    },

    /**
     * Reset window reference
     */
    onDestroy: function() {
        if (this._win) {
            this._win = null;
        }
    }
});
