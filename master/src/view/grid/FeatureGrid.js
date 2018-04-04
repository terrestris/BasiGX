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
        /**
         * The layer with the features to display in the grid.
         * @type {ol.layer.Vector}
         */
        layer: null,
        /**
         * The openlayers map.
         * @type {ol.Map}
         */
        map: null,
        /**
         * Attributes to ignore. Attributes in this list will not be shown in
         * the grid.
         * @type {Array}
         */
        ignoredAttributes: ['id'],
        /**
         * If set, grid selection will be synchronous with the features in the
         * layer. Selecting/deselecting features in the grid will add/remove
         * features from the selection layer.
         * @type {ol.layer.Vector}
         */
        selectionLayer: null
    },

    items: [{
        xtype: 'grid',
        selModel: 'checkboxmodel',
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
        this.down('grid').on('select', this.rowSelected, this);
        this.down('grid').on('deselect', this.rowDeselected, this);
    },

    /**
     * Overridden so we can register add/remove events on the layer's source.
     * @param  {ol.layer.Vector} selLayer the new selection layer
     */
    setSelectionLayer: function(selLayer) {
        this.bindOrUnbindSelectionEvents('un', this.selectionLayer);
        this.bindOrUnbindSelectionEvents('on', selLayer);
        this.selectionLayer = selLayer;
    },

    /**
     * Unregister openlayers add/remove events.
     */
    doDestroy: function() {
        this.bindOrUnbindSelectionEvents('un', this.selectionLayer);
        this.callParent();
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
                    function(result) {
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
                    ol.Observable.unByKey(me.addFeatureKey);
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
                    me.getIgnoredAttributes().indexOf(key) !== -1) {
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
    },

    /**
     * Finds a feature record in the store by original feature.
     * @param  {ol.Feature} feature the original features
     * @return {Object}         an ext record of the feature in the store, or
     * undefined
     */
    findFeatureInStore: function(feature) {
        var grid = this.down('grid');
        var store = grid.getStore();
        var index = store.findBy(function(rec) {
            if (rec.olObject.getId() === feature.getId()) {
                return true;
            }
        });
        if (index < 0) {
            return;
        }
        return store.getAt(index);
    },

    /**
     * Callback to select a feature if in grid.
     * @param  {Object} event openlayers add event
     */
    selectionFeatureAdded: function(event) {
        var grid = this.down('grid');
        var matched = this.findFeatureInStore(event.feature);
        var selection = grid.getSelection();
        if (selection.indexOf(matched) !== -1 || matched === undefined) {
            return;
        }
        selection.push(matched);
        grid.getSelectionModel().select(selection);
    },

    /**
     * Callback to deselect a feature if in grid.
     * @param  {Object} event openlayers remove event
     */
    selectionFeatureRemoved: function(event) {
        var grid = this.down('grid');
        var matched = this.findFeatureInStore(event.feature);
        grid.getSelectionModel().deselect([matched]);
    },

    /**
     * Callback when selecting a feature in the grid, to select the geometry
     * also in the map.
     * @param  {Ext.selection.Model} model  the selection Model
     * @param  {Ext.data.Model} record the feature record
     */
    rowSelected: function(model, record) {
        if (!this.selectionLayer) {
            return;
        }
        var source = this.selectionLayer.getSource();
        var id = record.olObject.getId();
        var matched;
        Ext.each(source.getFeatures(), function(feature) {
            if (feature.getId() === id) {
                matched = feature;
                return false;
            }
        });
        if (!matched) {
            var clone = record.olObject.clone();
            clone.setId(record.olObject.getId());
            source.addFeatures([clone]);
        }
    },

    /**
     * Callback when deselecting a feature in the grid, to deselect the geometry
     * also in the map.
     * @param  {Ext.selection.Model} model  the selection model
     * @param  {Ext.data.Model} record the feature record
     */
    rowDeselected: function(model, record) {
        if (!this.selectionLayer) {
            return;
        }
        var source = this.selectionLayer.getSource();
        var id = record.olObject.getId();
        var matched;
        Ext.each(source.getFeatures(), function(feature) {
            if (feature.getId() === id) {
                matched = feature;
                return false;
            }
        });
        if (matched) {
            try {
                source.removeFeature(matched);
            } catch (e) {
                // happens if deselected by selection tool
            }
        }
    },

    /**
     * Utility function to bind or unbind add/remove feature events on the
     * selection layer.
     * @param  {String} onOrOff either 'on' or 'un'
     * @param  {ol.layer.Vector} layer   the layer the events should be
     * (un)registered on
     */
    bindOrUnbindSelectionEvents: function(onOrOff, layer) {
        if (!layer) {
            return;
        }
        layer.getSource()[onOrOff](
            'addfeature',
            this.selectionFeatureAdded,
            this
        );
        layer.getSource()[onOrOff](
            'removefeature',
            this.selectionFeatureRemoved,
            this
        );
    }

});
