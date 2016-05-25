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
        url: 'http://nominatim.openstreetmap.org',
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
