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
 * CoordinateTransform Button
 *
 * Button used to instanciate the basigx-form-CoordinateTransform in order
 * to show and transform coordinates
 *
 * @class BasiGX.view.button.CoordinateTransform
 */
Ext.define('BasiGX.view.button.CoordinateTransform', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-coordinatetransform',

    requires: [
        'Ext.window.Window',
        'Ext.app.ViewModel',
        'BasiGX.view.form.CoordinateTransform',
        'BasiGX.util.Animate'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Koordinaten transformieren und anzeigen',
            text: 'Koordinaten transformieren',
            windowTitle: 'Koordinaten transformieren',
            documentation: '<h2>Koordinaten transformieren</h2>• Ein Klick ' +
                'auf den Button öffnet ein Fenster, in dem Koordinaten ' +
                'transformiert werden können.<br>• Geben Sie Koordinaten in ' +
                'die Eingabefelder ein, um sich anschließend den Punkt in ' +
                'der Karte anzeigen zu lassen.<br>• Klicken Sie alternativ ' +
                'in die Karte, um sich die jeweiligen Koordinaten anzeigen ' +
                'zu lassen'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * Array of CRS in EPSG notation that should be used.
     * By default EPSG:4326 will be used.
     */
    coordinateSystemsToUse: [{ code: 'EPSG:4326', name: 'WGS84' }],

    /**
     *
     */
    transformCenterOnRender: true,

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
        handler: function() {
            if (!this._win) {
                this._win = Ext.create('Ext.window.Window', {
                    name: 'coordinate-transform-window',
                    title: this.getViewModel().get('windowTitle'),
                    width: 500,
                    maxHeight: 500,
                    layout: 'fit',
                    constrain: true,
                    items: [{
                        xtype: 'basigx-form-coordinatetransform',
                        coordinateSystemsToUse: this.coordinateSystemsToUse,
                        transformCenterOnRender: this.transformCenterOnRender
                    }],
                    listeners: {
                        destroy: this.onDestroy,
                        scope: this
                    }
                });
                this._win.show();
            } else {
                BasiGX.util.Animate.shake(this._win);
            }
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
