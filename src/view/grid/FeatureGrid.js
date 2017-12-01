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
 * FeatureGrid
 *
 * A FeatureGrid showing the attribute values of features.
 *
 * @class BasiGX.view.grid.FeatureGrid
 */
Ext.define('BasiGX.view.grid.FeatureGrid', {
    xtype: 'basigx-grid-featuregrid',
    extend: 'Ext.panel.Panel',
    requires: [
        'GeoExt.data.store.Features'
    ],

    viewModel: {
        data: {
            renameButton: 'Umbenennen',
            renameBox: 'Bitte geben Sie den neuen Spaltennamen an:',
            deleteTitle: 'Löschen',
            deleteQuestion: 'Wollen Sie die Spalte wirklich löschen?'
        }
    },

    config: {
        layer: null,
        map: null,
        ignoredAttributes: ['id']
    },

    items: [{
        xtype: 'grid',
        selModel: 'cellmodel',
        plugins: {
            ptype: 'cellediting',
            clicksToEdit: 1
        }
    }],

    /**
     *
     */
    initComponent: function() {
        this.callParent();
        this.setLayerStore();
        this.registerEvents();
        this.createHighlightLayer(this.getMap());
        this.appendMenuEntries();
    },

    /**
     * Append extra column menu items.
     */
    appendMenuEntries: function() {
        var grid = this.down('grid');
        var viewModel = this.getViewModel();
        var menu = grid.view.headerCt.getMenu();
        menu.add(this.getRenameEntry(viewModel));
        menu.add(this.getDeleteEntry(viewModel));
    },

    /**
     * Get a rename column menu item.
     * @param  {Object} viewModel the view model of this component
     * @return {Object}           the menu item config
     */
    getRenameEntry: function(viewModel) {
        var me = this;
        return {
            text: viewModel.get('renameButton'),
            handler: function(item) {
                var column = item.up('gridcolumn').dataIndex;
                Ext.Msg.prompt(
                    viewModel.get('renameButton'),
                    viewModel.get('renameBox'),
                    function(result, text) {
                        if (result === 'ok') {
                            me.renameColumn(column, text);
                        }
                    },
                    this,
                    false,
                    column
                );
            }
        };
    },

    /**
     * Get a delete column menu item.
     * @param  {Object} viewModel the view model of this component
     * @return {Object}           the menu item config
     */
    getDeleteEntry: function(viewModel) {
        var me = this;
        return {
            text: viewModel.get('deleteTitle'),
            handler: function(item) {
                var column = item.up('gridcolumn').dataIndex;
                Ext.Msg.confirm(
                    viewModel.get('deleteTitle'),
                    viewModel.get('deleteQuestion'),
                    function(result, text) {
                        if (result === 'yes') {
                            me.deleteColumn(column);
                        }
                    }
                );
            }
        };
    },

    /**
     * Rename a column.
     * @param  {String} from name of the column to rename
     * @param  {String} to   name to rename the column to
     */
    renameColumn: function(from, to) {
        var features = this.getLayer().getSource().getFeatures();
        Ext.each(features, function(feature) {
            feature.set(to, feature.get(from));
            feature.set(from, undefined);
        });
        var store = this.down('grid').getStore();
        this.reconfigureStore(store);
    },

    /**
     * Delete the column from the store and reconfigure.
     * @param  {String} name name of the column to deleteTitle
     */
    deleteColumn: function(name) {
        var features = this.getLayer().getSource().getFeatures();
        Ext.each(features, function(feature) {
            feature.set(name, undefined);
        });
        var store = this.down('grid').getStore();
        this.reconfigureStore(store);
    },

    /**
     * Creates or fetches the highlight layer. The highlight layer is
     * only instantiated once, with the name 'highlight'.
     * @param  {BasiGX.component.Map} map the map
     */
    createHighlightLayer: function(map) {
        var layers = map.getMap().getLayers();
        var layer = BasiGX.util.Layer.getLayerBy('name', 'highlight', layers);
        if (layer) {
            this.highlightLayer = layer;
            this.highlightSource = layer.getSource();
            return;
        }
        this.highlightSource = new ol.source.Vector();
        this.highlightLayer = new ol.layer.Vector({
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: [255, 0, 0, 0.3]
                })
            }),
            source: this.highlightSource
        });
        this.highlightLayer.set('name', 'highlight');
        var displayInLayerSwitcherKey = BasiGX.util.Layer
            .KEY_DISPLAY_IN_LAYERSWITCHER;
        this.highlightLayer.set(displayInLayerSwitcherKey, false);
        map.getMap().addLayer(this.highlightLayer);
    },

    /**
     * Registers the mouseover events.
     */
    registerEvents: function() {
        var grid = this.down('grid');
        var me = this;
        grid.on('itemmouseenter', function(_, record) {
            var feat = record.olObject;
            me.highlightSource.clear();
            me.highlightSource.addFeature(feat);
        });
        grid.on('itemmouseleave', function() {
            me.highlightSource.clear();
        });
        if (this.getLayer().getSource().getFeatures().length === 0) {
            this.addFeatureKey = this.getLayer().getSource().once('addfeature',
                function() {
                    me.reconfigureStore(grid.getStore());
                    me.getLayer().getSource().unByKey(me.addFeatureKey);
                });
        }
    },

    /**
     * Sets the layer store on the grid.
     */
    setLayerStore: function() {
        var store = new GeoExt.data.store.Features({
            layer: this.getLayer()
        });

        this.reconfigureStore(store);
    },

    reconfigureStore: function(store) {
        var columns = this.extractSchema(store);
        this.down('grid').reconfigure(store, columns);
    },

    /**
     * Extracts the feature schema from the first feature in the store.
     * @param  {GeoExt.data.store.Features} store the layer store
     * @return {Array}       an array with the feature attribute names
     */
    extractSchema: function(store) {
        var me = this;
        var columns = [];
        var data = store.getData().items;
        if (data.length > 0) {
            Ext.iterate(data[0].data, function(key, value) {
                if (value === undefined || value && value.getExtent ||
                    me.getIgnoredAttributes().includes(key)) {
                    return;
                }
                columns.push({
                    text: key,
                    dataIndex: key,
                    editor: 'textfield'
                });
            });
        }
        return columns;
    }

});
