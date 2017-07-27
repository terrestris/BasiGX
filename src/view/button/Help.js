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
 * Help Button
 *
 * Button used to instantiate BasiGX.ux.ContextSensitiveHelp
 *
 * @class BasiGX.view.button.Help
 */
Ext.define('BasiGX.view.button.Help', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-help',

    requires: [
        'BasiGX.ux.ContextSensitiveHelp',
        'Ext.app.ViewModel'
    ],

    /**
     * Flag to enable the usage of the key `documentation`, which holds
     * an explanation of the component in HTML notation.
     * Useful, if you want to render a component specific help
     * instead of opening the regular HTML anchor link
     */
    getHelpFromComponent: false,

    /**
     * The URL to use for the help
     */
    helpUrl: '../help/index.html',

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Hilfe',
            text: null,
            documentation: '<h2>Hilfe</h2>• Ein Klick auf den Button ' +
                'aktiviert die kontextsensitive Hilfe.<br>• Sobald Sie ' +
                'anschließend mit der Maus auf eine Komponente der Anwendung ' +
                'klicken, erhalten Sie einen Hilfetext, der deren Benutzung ' +
                'erläutert'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf059@FontAwesome',
    html: '<i class="fa fa-question-circle fa-2x"></i>',

    /**
     *
     */
    config: {
        additonalHelpKeys: null,
        handler: function(button) {
            var help = Ext.create('BasiGX.ux.ContextSensitiveHelp', {
                getHelpFromComponent: this.getHelpFromComponent,
                helpUrl: this.helpUrl
            });
            help.setContextHelp(button.getAdditonalHelpKeys());
        }
    },

    /**
     * @param {String} url The URL to set
     */
    setHelpUrl: function(url) {
        this.helpUrl = url;
    }
});
