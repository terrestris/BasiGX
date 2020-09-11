/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 * `BasiGX.view.list.FocusableTreeItem`
 *
 * A class that can be used inside of `Ext.list.Tree` instances. This tree item
 * class differs to its parent in two points:
 *
 * * `BasiGX.view.list.FocusableTreeItem` instances can be focused; by clicking
 *   or by hitting the tab-key.
 * * If a focused treeitem receives a `keypress`-event that originates from
 *   either the space-bar or the the enter-key, the `selectionchange` event of
 *   the parent `Ext.list.Tree` is fired with the focused item passed as new
 *   selection
 *
 * @class BasiGX.view.list.FocusableTreeItem
 */
Ext.define('BasiGX.view.list.FocusableTreeItem', {
    extend: 'Ext.list.TreeItem',
    xtype: 'focusable-tree-item',

    /**
     * Changes the `element` specification to add the `tabIndex`-attribute to
     * the topmost container, but only if it didn't have it already.
     */
    makeFocusableElement: function() {
        var me = this;
        var spec = me.element;
        if (spec && Ext.isObject(spec)) {
            var hasTabIndex = Ext.isDefined(spec.tabIndex) ||
                Ext.isDefined(spec.tabindex);
            if (!hasTabIndex) {
                me.element.tabIndex = 0;
            }
        }
    },

    /**
     * Registers our `keypress`-handler to eventually trigger `selectionchange`
     * in the parent list.
     */
    bindFocusKeyPressHandler: function() {
        var me = this;
        me.getEl().on('keypress', me.onKeyPress, me);
    },

    /**
     * Our handler for the `keypress`-event on a focused list item. Will check
     * if the passed key was either the space-bar or the enter-key, and if so,
     * it will trigger an appropriate `selectionchange`-event in the parent
     * treelist.
     *
     * @param {Ext.event.Event} evt The `keypress`-event we detected, includes
     *     the pressed key.
     */
    onKeyPress: function(evt) {
        var me = this;
        var enter = Ext.event.Event.ENTER;
        var space = Ext.event.Event.SPACE;
        var pressedKey = evt.getKey();
        var list = me.up('treelist');
        if (list && (pressedKey === enter || pressedKey === space)) {
            list.setSelection(me.getNode());
            try {
                me.el.dom.click();
            } catch (e) {
                Ext.log('Problem when trying to emulate click on node: ' + e);
            }
        }
    },

    /**
     * Binds the focusenter and focusleave events to add/remove the
     * x-focused class.
     */
    bindFocusEvents: function() {
        this.getEl().on('focusenter', function() {
            this.dom.classList.add('x-focused');
        });
        this.getEl().on('focusleave', function() {
            this.dom.classList.remove('x-focused');
        });
    },

    /**
     * The constructor of `BasiGX.view.list.FocusableTreeItem`. First makes the
     * element focusable, and then registers a handler to handle `keypress`
     * events on focused list items.
     */
    constructor: function() {
        var me = this;
        me.makeFocusableElement();
        me.callParent(arguments);
        me.bindFocusKeyPressHandler();
        me.bindFocusEvents();
    }
});
