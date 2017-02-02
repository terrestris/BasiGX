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
 * A base class for windows which will provide everything that the parent class
 * `Ext.panel.Panel` has and additionally incorporates the plugin to add
 * structural HTML for enhanced accessibility (`BasiGX.plugin.AccessibleTitle`).
 *
 * @class BasiGX.view.panel.Accessible
 */
Ext.define('BasiGX.view.panel.Accessible', {
    alternateClassName: 'BasiGX.view.panel.A11y',
    extend: 'Ext.panel.Panel',
    requires: [
        'BasiGX.plugin.AccessibleTitle'
    ],
    plugins: [{
        ptype: 'a11ytitle',
        a11yHeadingLevel: 3
    }]
});
