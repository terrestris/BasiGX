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
 * Accessibility Utility class
 *
 * Some methods to enhance the accessibility of an ExtJS application.
 *
 * @class BasiGX.util.Accessibility
 */
Ext.define('BasiGX.util.Accessibility', {
    alternateClassName: 'BasiGX.util.A11y',
    statics: {

        /**
         * Returns an `Ext.Element` for the top-level `<html>`-element.
         *
         * @return {Ext.Element} The `Ext.Element` wrapped around the
         *     top-level `<html>`-element.
         */
        getHtmlElement: function() {
            return Ext.get(Ext.DomQuery.select('html')[0]);
        },

        /**
         * Sets the 'lang'-attribute of the top-level `<html>`-element to the
         * passed value. This enables screenreaders to pronounce the content
         * of a page better.
         *
         * @param {String} language The language to set. Should be an ISO 639-1
         *     language code, e.g. `'en'` or `'de'`.
         */
        setHtmlLanguage: function(language) {
            var htmlElem = BasiGX.util.Accessibility.getHtmlElement();
            if (htmlElem) {
                htmlElem.set({lang: language});
            }
        }

    }
});
