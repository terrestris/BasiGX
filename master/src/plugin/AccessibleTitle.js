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
 * A plugin that adds structural (but hidden) markup to enhance the
 * accessibility of an application.
 *
 * @class BasiGX.plugin.AccessibleTitle
 */
Ext.define('BasiGX.plugin.AccessibleTitle', {
    extend: 'Ext.plugin.Abstract',

    alias: 'plugin.a11ytitle',
    pluginId: 'a11ytitle',

    config: {
        /**
         * @cfg {Number} The level of the heading to add, e.g. `3` for a `<h3>`
         *     that should be added.
         */
        a11yHeadingLevel: 2
    },

    privates: {
        /**
         * @type {HTMLElement} The header element, usually a `<h2>`-element.
         *     The type varies depending on the #a11yHeadingLevel configuration.
         */
        addedHtmlHeader: null
    },

    /**
     * Called when this plugin is initialized. Will receive the instance of
     * `Ext.Component` that owns this plugin.
     *
     * @param {Ext.Component} cmp The component that owns the plugin.
     */
    init: function(cmp) {
        var me = this;
        cmp.on('afterrender', me.addA11yMarkup, me);
        Ext.override(cmp, {
            setTitle: function() {
                var overridenReturnVal = this.callParent(arguments);
                me.updateA11yMarkup();
                return overridenReturnVal;
            }
        });
        me.setCmp(cmp);
    },

    /**
     * The destroy method is invoked by the owning component at the time it
     * is being destroyed.
     */
    destroy: function() {
        var me = this;
        me.removeA11yMarkup();
        me.setCmp(null);
    },

    /**
     * The applier method which will update the created dom for the passed
     * new #a11yHeadingLevel.
     *
     * @param {Number} newLevel The level of the heading, e.g. `4` for `<h4>`.
     * @return {Number} The new level.
     */
    applyA11yHeadingLevel: function(newLevel) {
        var me = this;
        if (me.addedHtmlHeader) {
            var spec = me.getHeaderSpec(newLevel);
            me.addHtmlHeader(spec);
        }
        return newLevel;
    },

    /**
     * Called after the owning component is rendered, this method will determine
     * the heading level, an appropriate `Ext.DomHelper` specification and then
     * actually add the HTML by calling #addHtmlHeader.
     */
    addA11yMarkup: function() {
        var me = this;
        var level = me.getA11yHeadingLevel();
        var spec = me.getHeaderSpec(level);
        me.addHtmlHeader(spec);
    },

    /**
     * Adds the a11y header markup for the passed specification.
     *
     * @param {Object} spec The specification for the HTML to create.
     */
    addHtmlHeader: function(spec) {
        var me = this;
        if (me.addedHtmlHeader) {
            me.removeA11yMarkup();
        }
        var headerDom = me.getHeaderParent();
        if (!headerDom) {
            return;
        }
        me.addedHtmlHeader = Ext.DomHelper.insertFirst(headerDom, spec);
    },

    /**
     * Removes the added HTML, if any.
     */
    removeA11yMarkup: function() {
        var me = this;
        if (!me.addedHtmlHeader) {
            return;
        }
        var parentNode = me.addedHtmlHeader.parentNode;
        parentNode.removeChild(me.addedHtmlHeader);
    },

    /**
     * Return the element into which we want to add our HTML.
     *
     * @return {HTMLElement} The element into which we will add our HTML.
     */
    getHeaderParent: function() {
        var cmp = this.getCmp();
        var cmpParts = [cmp.header, cmp.body, cmp];
        var headerParent;
        Ext.each(cmpParts, function(part) {
            if (!headerParent && part && part.el && part.el.dom) {
                headerParent = part.el.dom;
            }
        });
        return headerParent;
    },

    /**
     * Returns a specification to be used with `Ext.DomHelper`.
     *
     * @param {Number} level The level of the heading, e.g. `4` for `<h4>`.
     * @return {Object} An appropriate `Ext.DomHelper` specification for the
     *     passed level.
     */
    getHeaderSpec: function(level) {
        var me = this;
        var cmp = me.getCmp();
        var spec = {
            tag: 'h' + level,
            style: 'display: none;',
            html: cmp.getTitle() // will be updated later, in updateA11yMarkup
        };
        return spec;
    },

    /**
     * Update the HTML of our header whenever the title of the owning component
     * changes.
     */
    updateA11yMarkup: function() {
        var me = this;
        var cmp = me.getCmp();
        if (me.addedHtmlHeader && cmp.getTitle) {
            Ext.get(me.addedHtmlHeader).setHtml(cmp.getTitle());
        }
    }
});
