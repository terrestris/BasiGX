/*global Ext, window, document*/
/* Copyright (C) 2011-present terrestris GmbH & Co. KG
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
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.-
 *
 * @author terrestris GmbH & Co. KG
 * @author M. Jansen <jansen@terrestris.de>
 */
/**
 * Provides a bunch of (static) methods to open a help window whose URL has an
 * anchor if the provided xy-location was found to have special documentation.
 *
 * Usually you create an instance of the class and then call #setContextHelp to
 * overlay the complete application with a layer that listens for clicks to get
 * contextual help. The #helpUrl will be opened in a popup after every click and
 * an anchor is appended to the URL, if the clicked component either has a
 * `xtype` or `helpKey` set to something that also exists in the list
 * #existingHelpKeys. Only instances of Ext.window.Window or more generally
 * instances of subclasses of Ext.container.Container qualifiy as candidates for
 * help.
 *
 * Based on code from Animal and timo.nuros at http://www.sencha.com/forum/showt
 * hread.php?63272-Implementing-a-context-sensitive-help
 *
 * @class BasiGX.ux.ContextSensitiveHelp
 */
Ext.define('BasiGX.ux.ContextSensitiveHelp', {
    statics: {

        /**
         * The base URL of the help HTML which contains named anchors as defined
         * in #existingHelpKeys.
         */
        helpUrl: '../help/index.html',

        /**
         * A list of all named links/anchors in the HTML file #helpUrl. Remember
         * to add all existing keys to this list.
         */
        existingHelpKeys: [
            'basigx-button-help',
            'basigx-button-zoomin',
            'basigx-button-zoomout',
            'basigx-button-zoomtoextent',
            'basigx-button-togglelegend',
            'basigx-overview-map-button',
            'basigx-button-addwms',
            'basigx-button-measure',
            'basigx-button-coordinatetransform',
            'basigx-button-permalink',
            'basigx-combo-scale',
            'basigx-button-hsi',
            'basigx-overview-map-button',
            'basigx-panel-layersetchooser',
            'basigx-form-print',
            'basigx-container-overpasssearch'
        ],

        /* begin i18n */

        /**
         * Title for the warning when a popup blocker is active.
         */
        warnPopupBlockerTitle: 'Warnung',

        /**
         * Content of the warning when a popup blocker is active.
         */
        warnPopupBlockerContent: 'Bitte deaktivieren Sie etwaige ' +
            'Popup-Blocker,um die Hilfe anzuzeigen.',

        /* end i18n */

        /**
         * Return a component for the passed element `el`.
         *
         * TODO does this actually do what it tells me it does?
         *
         * @param {HTMLElement} el The HTML element.
         * @return {Ext.Component} The component.
         */
        getCmpFromEl: function(el) {
            var cmp = Ext.getCmp(el.id);
            if (!cmp) {
                return this.getCmpFromEl(el.parentNode);
            } else {
                return cmp;
            }
        },

        /**
         * Returns the lowest level component at the specified point.
         *
         * TODO Double check whether we can really pass only a x-coordinate, I
         *      doubt that right now.
         *
         * @param {Ext.util.Point|Number} point The point at which to find the
         *     associated component, or the x coordinate of the point.
         * @return {Ext.Component} The Component at the specified point.
         */
        getComponentFromPoint: function(point) {
            var el = document.elementFromPoint(point.x, point.y);
            var cmp = this.getCmpFromEl(el);
            return cmp;
        },

        /**
         * Bubbles up the component hierarchy until it finds one component for
         * which we have a help.
         *
         * @param {Ext.component} component The component from which we'll
         *     bubble up until we find one that we have help for.
         * @return {Ext.component} The found component.
         */
        bubbleToExistingHelp: function(component) {
            var helpClass = BasiGX.ux.ContextSensitiveHelp;
            var existingHelpKeys = helpClass.existingHelpKeys;
            var foundHelp;
            var parent;
            var xtypeHasHelp = Ext.Array.contains(
                existingHelpKeys, component.getXType()
            );
            var compHasHelpKey = Ext.Array.contains(
                existingHelpKeys, component.helpKey
            );

            if (xtypeHasHelp || compHasHelpKey) {
                foundHelp = compHasHelpKey ?
                    component.helpKey : component.getXType();
            } else {
                parent = component.up();
                if (parent) {
                    foundHelp = helpClass.bubbleToExistingHelp(parent);
                }
            }
            return foundHelp;
        },

        /**
         * Determines the component at the passed pointb that has help info
         * available, and opens an appropriate URL in a new window if possible.
         *
         * @param {Ext.util.Point} point The point at which the pointer rests.
         * @return {Boolean} Always true. We can probably remove this return
         *     value.
         */
        displayHelpForCoordinates: function(point) {
            var helpClass = BasiGX.ux.ContextSensitiveHelp;
            var component = helpClass.getComponentFromPoint(point);
            var helpKey = helpClass.bubbleToExistingHelp(component);
            var helpUrl = helpClass.helpUrl;
            var win;

            if (helpKey) {
                helpUrl += '#' + helpKey;
            }
            win = window.open(helpUrl, 'ContextSensitiveHelp',
                'width=800,height=550,scrollbars=yes,left=200,top=150,' +
                'resizable=yes,location=yes,menubar=no,status=no,' +
                'dependent=yes');

            if (win) {
                win.focus();
            } else {
                Ext.Msg.alert(
                    helpClass.warnPopupBlockerTitle,
                    helpClass.warnPopupBlockerContent
                );
            }
            return true;
        }
    },

    /**
     * The Main method of an instance of this class.
     *
     * @param {Array<String>} [additionalHelpKeys] An array of additional keys
     *     for which help exists.
     */
    setContextHelp: function(additionalHelpKeys) {
        var me = this;
        var size = Ext.getBody().getSize();
        var helpDom = document.createElement('div');
        var helpLayer = Ext.get(helpDom);

        if (additionalHelpKeys) {
            Ext.Array.push(
                BasiGX.ux.ContextSensitiveHelp.existingHelpKeys,
                additionalHelpKeys
            );
        }

        document.body.insertBefore(helpDom, document.body.firstChild);

        helpLayer.setSize(size);
        helpLayer.setStyle({
            'cursor': 'help',
            'position': 'absolute'
        });
        helpLayer.setZIndex(20000);

        helpLayer.on('click', function(clickEvent) {
            var point = Ext.util.Point.fromEvent(clickEvent);
            me.helpLayer.destroy();
            BasiGX.ux.ContextSensitiveHelp.displayHelpForCoordinates(point);
            me.destroy();
        });
        helpLayer.show();

        me.helpLayer = helpLayer;
    }
});
