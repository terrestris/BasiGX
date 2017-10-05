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
 * Data Store for gazetteer search
 *
 * @class BasiGX.store.GazetteerSearch
 */
Ext.define('BasiGX.store.GazetteerSearch', {
    extend: 'Ext.data.Store',

    alias: 'store.basigx-gazetteersearch',

    requires: [
        'BasiGX.util.Layer'
    ],

    /**
     * Stores the last request to be able to abort it manually.
     * @private
     */
    _lastRequest: null,

    proxy: {
        url: 'https://nominatim.openstreetmap.org',
        method: 'GET',
        type: 'ajax',
        extraParams: {
            q: null,
            format: 'json',
            limit: 100,
            viewboxlbrt: '-180,90,180,-90',
            bounded: 1,
            polygon_text: 1
        },
        limitParam: 'maxFeatures',
        reader: {
            type: 'json',
            rootProperty: 'features'
        }
    },

    fields: [{
        name: 'place_id',
        type: 'string'
    }, {
        name: 'licence',
        type: 'string'
    }, {
        name: 'osm_type',
        type: 'string'
    }, {
        name: 'osm_id',
        type: 'number'
    }, {
        name: 'boundingbox',
        type: 'auto'
    }, {
        name: 'lat',
        type: 'number'
    }, {
        name: 'lon',
        type: 'number'
    }, {
        name: 'geotext',
        type: 'auto'
    }, {
        name: 'icon',
        type: 'string'
    }, {
        name: 'class',
        type: 'string'
    }, {
        name: 'type',
        type: 'string'
    }, {
        name: 'importance',
        type: 'number'
    }, {
        name: 'icon',
        type: 'string'
    }]
});
