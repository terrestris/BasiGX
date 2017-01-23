/* Copyright (c) 2017 terrestris GmbH & Co. KG
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
 * Copy-to-clipboard utilities.
 *
 * @class BasiGX.util.CopyClipboard
 */
Ext.define('BasiGX.util.CopyClipboard', {

    statics: {

        /**
         * Property indicating the current browser support of the query command
         * 'copy'.
         *
         * @readonly
         * @type {Boolean} isSupported Whether the 'copy' command is supported
         *                             or not.
         */
        copyToClipboardSupported: document.queryCommandSupported('copy'),

        /**
         * Copies the given value to the clipboard.
         *
         * @param {String|Number} copyText The text to copy to the clipboard.
         * @param {Function} cbSuccess The callback function to call on copy to
         *                             clipboard success. Optional.
         * @param {Function} cbFailure The callback function to call on copy to
         *                             clipboard failure. Optional.
         * @param {Function} cbScope The scope to use in the callback
         *                           functions. Optional.
         */
        copyTextToClipboard: function(copyText, cbSuccess, cbFailure, cbScope) {
            var staticMe = BasiGX.util.CopyClipboard;

            if (!staticMe.copyToClipboardSupported) {
                Ext.Logger.warn('Copy to clipboard is not supported ' +
                        'by the browser!');
            }

            var dh = Ext.DomHelper;
            var spec = {
                tag: 'input',
                id: 'hidden-copy-paste-textarea',
                style: 'height:0;'
            };
            var hiddenInputField = dh.append(
                Ext.getBody(),
                spec
            );

            hiddenInputField.value = copyText;
            hiddenInputField.select();

            try {
                var success = document.execCommand('copy');
                if (success) {
                    if (Ext.isFunction(cbSuccess)) {
                        cbSuccess.call(cbScope);
                    }
                } else {
                    if (Ext.isFunction(cbFailure)) {
                        cbFailure.call(cbScope);
                    }
                }
                hiddenInputField.remove();
            } catch (err) {
                if (Ext.isFunction(cbFailure)) {
                    cbFailure.call(cbScope);
                }
                hiddenInputField.remove();
            }
        }
    }

});
