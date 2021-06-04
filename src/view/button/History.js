/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * A history navigation button in order to interact with the HTML5 History API.
 *
 * Since the History API is supported by current browsers down to IE10 the usage
 * of this might need a polyfill
 * (like https://github.com/browserstate/history.js/) in older browsers,
 * see https://caniuse.com/#search=history for details.
 *
 * @class BasiGX.view.button.History
 */
Ext.define('BasiGX.view.button.History', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-history',

    requires: [
        'Ext.app.ViewModel'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltipBack: 'Zur vorigen Ansicht navigieren',
            tooltipForward: 'Zur nächsten Ansicht navigieren'
        }
    },

    /**
     * Direction of history navigation. Either 'BACK' or 'FORWARD'.
     * @cfg {String}
     */
    direction: 'BACK',

    /**
     * [mode description]
     * @type {String}
     */
    mode: 'HISTORY',

    /**
     * @private
     */
    initComponent: function() {
        var me = this;

        // check if HTML5 History API is available, otherwise disable this
        // button to prevent errors.
        // see https://caniuse.com/#search=history
        if (!Ext.supports.History) {
            me.mode = 'LEGACY';
            me.setDisabled(true);
            Ext.log.warn('Your browser does not support HTML5 History API. ' +
                'Legacy mode for BasiGX.view.button.History not available');
        }

        me.callParent();

        me.on('click', me.onBtnClick);
    },

    /**
     * Called when the button is clicked.
     * Performs the navigation action
     *
     * @param {Ext.Button} btn The history button itself
     */
    onBtnClick: function(btn) {
        var me = this;
        if (me.mode === 'HISTORY') {
            if (btn.direction === 'BACK') {
                window.history.back();
            } else if (btn.direction === 'FORWARD') {
                window.history.forward();
            }
        }
    }

});
