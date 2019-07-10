/* Copyright (c) 2016-present terrestris GmbH & Co. KG
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
 *
 * MsgBox Util
 *
 * Message box utilities for a common user experience.
 *
 * @class BasiGX.util.MsgBox
 */
Ext.define('BasiGX.util.MsgBox', {
    requires: [
        'Ext.util.DelayedTask',
        'Ext.window.MessageBox'
    ],
    statics: {

        /**
         * The amount of milliseconds to wait before bringing {Ext.MessageBox}
         * instances to the front of the visual element stack. Setting this to a
         * value smaller than `0` will immediately bring the message box to the
         * front. The method #bringToFront makes use of this configuration.
         */
        toFrontDelayMS: 50,

        /*begin i18n*/
        msgBoxTitleInfo: 'Info',
        msgBoxTitleWarn: 'Warn',
        msgBoxTitleError: 'Error',
        msgBoxTitlePrompt: 'Question',
        /*end i18n*/

        /**
         * Takes an instance of {Ext.MessageBox} and brings it to the front
         * of the visual element stack after a timeout specified in the
         * configuration #toFrontDelayMS.
         *
         * As suggested in [this thread](http://www.sencha.com/forum/
         * showthread.php?127202-Ext-Messagebox-appearing-behind-modal-window),
         * we need to have a delay before bringing the window to the front. The
         * configuration #toFrontDelayMS controls the number of milliseconds to
         * wait.
         *
         * @param {Ext.MessageBox} msgBox The message box to bring to the front
         * @private
         */
        bringToFront: function(msgBox) {
            var delay = BasiGX.util.MsgBox.toFrontDelayMS;
            var toFrontFunc = function() {
                msgBox.toFront();
            };
            var toFrontTask;

            if (parseFloat(delay) > 0) {
                toFrontTask = new Ext.util.DelayedTask(toFrontFunc);
                toFrontTask.delay(delay);
            } else {
                toFrontFunc.call();
            }
        },

        /**
         * Basic show method used by the various specific implementations.
         *
         * @param {String} msg The message that we'll show.
         * @param {Object} [defaultConf] The specific configuration default as
         *     described in the {@link Ext.MessageBox#method-show show-method}
         *     of the Ext.MessageBox. Will be set from the public methods.
         * @param {Object} [userConf] Optional configuration as described in the
         *     {@link Ext.MessageBox#method-show show-method of the
         *     Ext.MessageBox}.
         * @private
         */
        show: function(msg, defaultConf, userConf) {
            var staticMe = BasiGX.util.MsgBox;
            var msgInConf = Ext.apply({msg: msg}, userConf);
            var msgConfig = Ext.apply(defaultConf, msgInConf);
            var msgBox = Ext.Msg.show(msgConfig);
            staticMe.bringToFront(msgBox);
        },

        /**
         * Shows an information message box with the specified message.
         *
         * Can be further configured with the options specified in the {@link
         * Ext.MessageBox#method-show show-method of the Ext.MessageBox-class}.
         *
         * @param {String} msg The message that we'll show.
         * @param {Object} [userConf] Optional configuration as described in the
         *     {@link Ext.MessageBox#method-show show-method of the
         *     Ext.MessageBox}.
         */
        info: function(msg, userConf) {
            var staticMe = BasiGX.util.MsgBox;
            var defaultConf = {
                title: staticMe.msgBoxTitleInfo,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.INFO
            };
            staticMe.show(msg, defaultConf, userConf);
        },

        /**
         * Shows a warning message box with the specified message.
         *
         * Can be further configured with the options specified in the {@link
         * Ext.MessageBox#method-show show-method of the Ext.MessageBox-class}.
         *
         * @param {String} msg The message that we'll show.
         * @param {Object} [userConf] Optional configuration as described in the
         *     {@link Ext.MessageBox#method-show show-method of the
         *     Ext.MessageBox}.
         */
        warn: function(msg, userConf) {
            var staticMe = BasiGX.util.MsgBox;
            var defaultConf = {
                title: staticMe.msgBoxTitleWarn,
                buttons: Ext.MessageBox.OK,
                icon: Ext.Msg.WARNING
            };
            staticMe.show(msg, defaultConf, userConf);
        },

        /**
         * Shows an error message box with the specified message.
         *
         * Can be further configured with the options specified in the {@link
         * Ext.MessageBox#method-show show-method of the Ext.MessageBox-class}.
         *
         * @param {String} msg The message that we'll show.
         * @param {Object} [userConf] Optional configuration as described in the
         *     {@link Ext.MessageBox#method-show show-method of the
         *     Ext.MessageBox}.
         */
        error: function(msg, userConf) {
            var staticMe = BasiGX.util.MsgBox;
            var defaultConf = {
                title: staticMe.msgBoxTitleError,
                buttons: Ext.MessageBox.OK,
                icon: Ext.Msg.ERROR
            };
            staticMe.show(msg, defaultConf, userConf);
        },

        /**
         * Shows a prompt message box with the specified message.
         *
         * Can be further configured with the options specified in the {@link
         * Ext.MessageBox#method-show show-method of the Ext.MessageBox-class}.
         *
         * @param {String} msg The message that we'll show.
         * @param {Object} [userConf] Optional configuration as described in the
         *     {@link Ext.MessageBox#method-show show-method of the
         *     Ext.MessageBox}.
         */
        prompt: function(msg, userConf) {
            var staticMe = BasiGX.util.MsgBox;
            var defaultConf = {
                title: staticMe.msgBoxTitlePrompt,
                buttons: Ext.MessageBox.OKCANCEL,
                icon: Ext.Msg.QUESTION,
                width: 400,
                prompt: true
            };
            staticMe.show(msg, defaultConf, userConf);
        },

        /**
         * Shows a confirm message box with the specified message.
         *
         * Can be further configured with the options specified in the {@link
         * Ext.MessageBox#method-show show-method of the Ext.MessageBox-class}.
         *
         * @param {String} msg The message that we'll show.
         * @param {Object} [userConf] Optional configuration as described in the
         *     {@link Ext.MessageBox#method-show show-method of the
         *     Ext.MessageBox}.
         */
        confirm: function(msg, userConf) {
            var staticMe = BasiGX.util.MsgBox;
            var defaultConf = {
                title: staticMe.msgBoxTitlePrompt,
                buttons: Ext.MessageBox.YESNO,
                icon: Ext.Msg.QUESTION
            };
            staticMe.show(msg, defaultConf, userConf);
        }
    }
}, function() {
    var util = BasiGX.util.MsgBox;
    Ext.applyIf(BasiGX, {
        /**
         * This method is an alias for {@link BasiGX.util.MsgBox#info}.
         *
         * Usage example:
         *
         *     BasiGX.info("The operation completed successfully.");
         *
         * @member BasiGX
         * @method info
         * @inheritdoc BasiGX.util.MsgBox#info
         */
        info: util.info,

        /**
         * This method is an alias for {@link BasiGX.util.MsgBox#warn}.
         *
         * Usage example:
         *
         *     BasiGX.warn("The operation might not succeed.");
         *
         * @member BasiGX
         * @method warn
         * @inheritdoc BasiGX.util.MsgBox#warn
         */
        warn: util.warn,

        /**
         * This method is an alias for {@link BasiGX.util.MsgBox#error}.
         *
         * Usage example:
         *
         *     BasiGX.error("The operation failed.");
         *
         * @member BasiGX
         * @method error
         * @inheritdoc BasiGX.util.MsgBox#error
         */
        error: util.error,

        /**
         * This method is an alias for {@link BasiGX.util.MsgBox#prompt}.
         *
         * Usage example:
         *
         *     BasiGX.prompt("Please enter name for whatever", {
         *         fn: function(decision, text){
         *             if (decision === 'ok') {
         *                 alert("You entered " + text);
         *             } else {
         *                 alert("Action cancelled.");
         *             }
         *         },
         *         value: 'prefilled value'
         *     });
         *
         * @member BasiGX
         * @method prompt
         * @inheritdoc BasiGX.util.MsgBox#prompt
         */
        prompt: util.prompt,

        /**
         * This method is an alias for {@link BasiGX.util.MsgBox#confirm}.
         *
         * Usage example:
         *
         *     BasiGX.confirm("Please enter name for whatever", {
         *         fn: function(decision){
         *             if (decision === 'yes') {
         *                 alert("You chose yes");
         *             } else {
         *                 alert("Action cancelled.");
         *             }
         *         }
         *     });
         *
         * @member BasiGX
         * @method confirm
         * @inheritdoc BasiGX.util.MsgBox#confirm
         */
        confirm: util.confirm
    });
});
