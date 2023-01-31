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
 * Projection model for use with the Projections Store
 *
 * @class BasiGX.model.Projection
 */
Ext.define('BasiGX.model.Projection', {
    extend: 'Ext.data.Model',
    idProperty: 'code',
    fields: [{
        name: 'code',
        type: 'int'
    }, {
        name: 'accuracy',
        type: 'string'
    }, {
        name: 'area',
        type: 'string'
    }, {
        name: 'authority',
        type: 'string'
    }, {
        name: 'bbox',
        type: 'auto'
    }, {
        name: 'default_trans',
        type: 'number'
    }, {
        name: 'kind',
        type: 'string'
    }, {
        name: 'name',
        type: 'string'
    }, {
        name: 'proj4',
        type: 'string'
    }, {
        name: 'trans',
        type: 'auto'
    }, {
        name: 'unit',
        type: 'string'
    }, {
        name: 'wkt',
        type: 'string'
    }]
});
