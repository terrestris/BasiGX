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
 *  A grid showing results of the multisearch gazetteer response values.
 *  inspired by BasiGX.view.grid.GazetteerGrid
 *  This class is used by BasiGX.view.form.field.MultiSearchCombo
 *
 * @class BasiGX.view.grid.MultiSearchGazetteerGrid
 *
 * @extends Ext.grid.Panel
 *
 * @requires BasiGX.store.GazetteerSearch
 * @requires BasiGX.util.Map
 * @requires BasiGX.util.Layer
 * @requires BasiGX.util.Animate
 *
 */
Ext.define('BasiGX.view.grid.MultiSearchGazetteerGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'basigx-grid-multisearchgazetteergrid',

    requires: [
        'BasiGX.store.GazetteerSearch',
        'BasiGX.util.Map',
        'BasiGX.util.Layer',
        'BasiGX.util.Animate'
    ],

    store: {
        type: 'basigx-gazetteersearch'
    },

    viewModel: {
        data: {
            title: 'Gazetteer Suche'
        }
    },

    bind: {
        title: '{title}'
    },

    cls: 'search-result-grid',

    collapsible: true,

    titleCollapse: true,

    collapseDirection: 'top',

    headerPosition: 'left',

    hideHeaders: true,

    maxHeight: 180,

    config: {

        layer: null,

        map: null

    },

    columns: {
        items: [{
            text: '',
            xtype: 'templatecolumn',
            width: 40,
            tpl: '<img src="{icon}" height="16" width="16">'
        }, {
            text: 'Name',
            xtype: 'templatecolumn',
            tpl: '<div data-qtip="{display_name}">' +
            '{display_name}' +
            '</div>',
            flex: 2
        }, {
            text: 'Class Type',
            xtype: 'templatecolumn',
            tpl: '{class} - {type}',
            flex: 1
        }]
    },

    /**
    *
    */
    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        // add listeners
        me.on('boxready', me.onBoxReady, me);
        me.on('itemmouseenter', me.onItemMouseEnter, me);
        me.on('itemmouseleave', me.onItemMouseLeave, me);
        me.on('itemclick', me.onItemClick, me);

        // unregister listeners on grid hide
        me.on('hide', me.unregisterListeners, me);
    },

    /**
     * Called by OnBoxeady listener to add the search layer
     */
    onBoxReady: function() {
        var me = this;
        if (!me.getMap()) {
            var map = BasiGX.util.Map.getMapComponent().getMap();
            me.setMap(map);
        }
        if (!me.getLayer()) {
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            layer.set(displayInLayerSwitcherKey, false);
            me.setLayer(layer);
            me.getMap().addLayer(layer);
        }
    },

    /**
     * Called by onitemmouseenter listener to highlight the hovered search
     * results on the map.
     *
     * @param {Ext.grid.Panel} grid The grid panel.
     * @param {Ext.data.Model} record The record that belongs to the item.
     */
    onItemMouseEnter: function(grid, record) {
        var me = this;
        var layer = me.getLayer();
        var projection = me.getMap().getView().getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('geotext');
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        layer.getSource().addFeature(feature);
    },

    /**
     * Called by onitemmouseleave listener to unhighlight the search
     * results on the map
     */
    onItemMouseLeave: function() {
        var me = this;
        var layer = me.getLayer();
        layer.getSource().clear();
    },

    /**
     * Called by onitemclick listener to center map on clicked item.
     *
     * @param {Ext.grid.Panel} grid The grid panel.
     * @param {Ext.data.Model} record The record that belongs to the item.
     */
    onItemClick: function(grid, record) {
        var me = this;
        var map = me.getMap();
        var olView = map.getView();
        var projection = olView.getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('geotext');
        var feature = format.readFeature(wkt);
        var geom = feature.getGeometry().transform('EPSG:4326', projection);
        olView.fit(geom, map.getSize());
    },

    /**
     * Called by onhide listener to deactivate all listeners when inactive.
     */
    unregisterListeners: function() {
        var me = this;

        me.un('boxready', me.onBoxReady, me);
        me.un('itemmouseenter', me.onItemMouseEnter, me);
        me.un('itemmouseleave', me.onItemMouseLeave, me);
        me.un('itemclick', me.onItemClick, me);
    },

    /**
     * Called by BasiGX.view.form.field.MultiSearchCombo.doGazetteerSearch()
     * This method does the actual search by updating the according store.
     * It decides if the search should be done in the visible extent only.
     *
     * @param {string} value The search term.
     * @param {boolean} limitToBBox Search is limited to visible extent.
     */
    doGazetteerSearch: function(value, limitToBBox) {

        var me = this;

        var store = me.getStore();

        Ext.Ajax.abort(store._lastRequest);

        store.getProxy().setExtraParam('q', value);

        if (limitToBBox) {
            var map = BasiGX.util.Map.getMapComponent().getMap();
            var olView = map.getView();
            var projection = olView.getProjection().getCode();
            var bbox = map.getView().calculateExtent(map.getSize());
            var transformedBbox = ol.proj.transformExtent(bbox, projection,
                    'EPSG:4326');
            store.getProxy().setExtraParam('viewboxlbrt',
                    transformedBbox.toString());
        } else {
            store.getProxy().setExtraParam('viewboxlbrt', null);
        }
        store.load();
        store._lastRequest = Ext.Ajax.getLatest();

        me.expand();

    }

});
