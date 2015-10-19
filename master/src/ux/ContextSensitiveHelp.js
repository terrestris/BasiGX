/*global Ext, window, document*/

/* Copyright (C) 2011-2013 terrestris GmbH & Co. KG, info@terrestris.de
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
 * Based on code from Animal and timo.nuros at
 * http://www.sencha.com/forum/showthread.php?63272-Implementing-a-context-sensitive-help
 */
Ext.define('BasiGX.ux.ContextSensitiveHelp', {
    statics: {

        /**
         * The base URL of the help HTML which contains named anchors as defined
         * in #existingHelpKeys.
         */
        helpUrl: "../help/index.html",

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

        getCmpFromEl: function(el){
            var cmp = Ext.getCmp(el.id);
            if(!cmp){
                return this.getCmpFromEl(el.parentNode);
            } else {
              return cmp;
            }
        },

        /**
         * Returns the lowest level Component at the specified point.
         *
         * @param {Ext.util.Point/Number} p The Point at which to find the
         *     associated Component, or the X coordinate of the point.
         * @return {Ext.Component} The Component at the specified point.
         */
        getComponentFromPoint: function(point) {
            var el = document.elementFromPoint(point.x, point.y);
            var cmp = this.getCmpFromEl(el);
            return cmp;
        },

        /**
         *
         */
        bubbleToExistingHelp: function(component) {
            var helpClass = BasiGX.ux.ContextSensitiveHelp,
                existingHelpKeys = helpClass.existingHelpKeys,
                foundHelp,
                parent,
                xtypeHasHelp = Ext.Array.contains(existingHelpKeys,
                    component.getXType()),
                compHasHelpKey = Ext.Array.contains(existingHelpKeys,
                    component.helpKey);

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
         *
         */
        displayHelpForCoordinates: function(point) {
            var helpClass = BasiGX.ux.ContextSensitiveHelp,
                component = helpClass.getComponentFromPoint(point),
                helpKey = helpClass.bubbleToExistingHelp(component),
                helpUrl = helpClass.helpUrl,
                win;

            if (helpKey) {
                helpUrl += "#" + helpKey;
            }
            win = window.open(helpUrl, "ContextSensitiveHelp",
                "width=800,height=550,scrollbars=yes,left=200,top=150," +
                "resizable=yes,location=yes,menubar=no,status=no," +
                "dependent=yes");

            if(win) {
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
     */
    setContextHelp: function(additionalHelpKeys) {
        var me = this,
            size = Ext.getBody().getSize();
        var helpDom = document.createElement('div');
        var helpLayer = Ext.get(helpDom);

        if(additionalHelpKeys){
            Ext.Array.push(BasiGX.ux.ContextSensitiveHelp.existingHelpKeys,
                    additionalHelpKeys);
        }

        document.body.insertBefore(helpDom, document.body.firstChild);

        helpLayer.setSize(size);
        helpLayer.setStyle({
            "cursor": "help",
            "position": "absolute"
        });
        helpLayer.setZIndex(20000);

        helpLayer.on("click", function(clickEvent) {
            var point = Ext.util.Point.fromEvent(clickEvent);

            me.helpLayer.destroy();
            BasiGX.ux.ContextSensitiveHelp.
                displayHelpForCoordinates(point);
            me.destroy();
        });
        helpLayer.show();

        me.helpLayer = helpLayer;
    }
});
