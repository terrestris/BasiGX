/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * CSW Button
 *
 * Button used to instanciate the basigx-form-csw in order to add a
 * service to the map
 *
 * @class BasiGX.view.button.CSW
 */
Ext.define('BasiGX.view.button.CSW', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-csw',

    requires: [
        'Ext.window.Window',
        'Ext.app.ViewModel',
        'BasiGX.view.form.CSW',
        'BasiGX.util.Animate'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Katalogservice für externe Karteninhalte (CSW) abfragen',
            text: 'CSW <span style="font-size: 1.7em; ' +
                'font-weight: normal;">⊕</span>',
            windowTitle: 'Web Catalogue Service (CSW) abfragen',
            documentation: '<h2>CSW abfragen</h2>• Ein Klick auf den ' +
                'Button öffnet ein Fenster, in dem Sie mit Hilfe einer ' +
                'CSW-URL einen Kartendienst der Karte hinzufügen ' +
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
                name: 'csw-window',
                title: this.getViewModel().get('windowTitle'),
                width: 500,
                height: 400,
                layout: 'fit',
                constrain: true,
                items: [{
                    xtype: 'basigx-form-csw'
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
     * Do any necessary cleanup (e.g. remove listeners, destroy dependent
     * objects …).
     */
    onDestroy: function() {
        if (this._win) {
            this._win = null;
        }
    }
});
