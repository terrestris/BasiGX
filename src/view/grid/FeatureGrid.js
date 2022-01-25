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
        'Ext.Array',
        'Ext.grid.filters.Filters',
        'BasiGX.util.WFS',
        'BasiGX.util.WFST',
        'GeoExt.data.store.Features'
    ],

    viewModel: {
        data: {
            renameButton: 'Umbenennen',
            renameBox: 'Bitte geben Sie den neuen Spaltennamen an:',
            deleteTitle: 'Löschen',
            deleteQuestion: 'Wollen Sie die Spalte wirklich löschen?',
            saveButton: 'Speichern',
            saveErrorText: 'Änderungen konnten nicht gespeichert werden.'
        }
    },

    config: {
        /**
         * The layer with the features to display in the grid.
         * @type {ol.layer.Vector}
         */
        layer: null,
        /**
         * The BasiGX map component.
         * @type {BasiGX.component.Map}
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
        selectionLayer: null,
        /**
         * If set to true, a column with a zoom to feature button will be added.
         * The column can be sorted and is ordered by the selection (selected
         * rows are considered smaller than non selected rows).
         * @type {boolean}
         */
        addZoomButton: false,

        /* eslint-disable */
        /**
         * Configures locking on the grid. See https://docs.sencha.com/extjs/6.2.0/classic/Ext.grid.Panel.html#cfg-enableLocking
         */
        enableLocking: true,
        /**
         * Configures the grid header. See https://docs.sencha.com/extjs/6.2.0/classic/Ext.grid.Panel.html#cfg-header
         */
        gridHeader: undefined,
        /* eslint-enable */
        /**
         * Configures filtering on the grid.
         */
        enableFiltering: false,
        /* eslint-enable */
        /**
         * Configures editing of the grid.
         */
        enableEditing: false
        /* eslint-enable */
    },

    items: [],


    constructor: function() {
        var me = this;

        me.selectionFeatureAdded = me.selectionFeatureAdded.bind(me);
        me.selectionFeatureRemoved = me.selectionFeatureRemoved.bind(me);
        me.callParent(arguments);
    },

    /**
     *
     */
    initComponent: function() {
        this.callParent();
        var gridOpts = {
            xtype: 'grid',
            selModel: 'checkboxmodel',
            enableLocking: this.getEnableLocking(),
            header: this.getGridHeader(),
            plugins: [
                {
                    ptype: 'cellediting',
                    clicksToEdit: 1
                },
                'gridfilters'
            ],
            listeners: {
                cellclick: function(view, td, colIdx, record) {
                    var grid = this.up('basigx-grid-featuregrid');
                    var mapView = grid.getMap().map.getView();
                    if (grid.getAddZoomButton()) {
                        if (colIdx === 1 && record.olObject.getGeometry()) {
                            mapView.fit(record.olObject.getGeometry(), {
                                duration: 300
                            });
                        }
                    }
                }
            }
        };
        if (this.enableEditing) {
            gridOpts.tbar = ['->', {
                type: 'button',
                bind: {
                    text: this.getViewModel().get('saveButton')
                },
                handler: this.onSaveClick.bind(this)
            }];
        }
        this.add(gridOpts);
        this.setLayerStore();
        this.registerEvents();
        this.createHighlightLayer(this.getMap());
        this.appendMenuEntries();
        var grid = this.down('grid');
        grid.on('select', this.rowSelected, this);
        grid.on('deselect', this.rowDeselected, this);
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

        var color = [255, 0, 0, 0.3];
        var stroke = new ol.style.Stroke({
            color: color,
            width: 1
        });
        var fill = new ol.style.Fill({
            color: color
        });

        this.highlightLayer = new ol.layer.Vector({
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    fill: fill,
                    stroke: stroke,
                    radius: 5
                }),
                fill: fill,
                stroke: stroke
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
     * Compares two rows by checking if they are selected or not.
     * @param  {Ext.data.Model} a the first record
     * @param  {Ext.data.Model} b the second record
     * @return {Number} 0, 1, -1, depending on whether a > b
     */
    selectionCompareFunction: function(a, b) {
        var grid = this.down('grid');
        var selection = grid.getSelection();
        var aSelected = false;
        var bSelected = false;
        Ext.each(selection, function(item) {
            if (item === a) {
                aSelected = true;
            }
            if (item === b) {
                bSelected = true;
            }
        });
        if (aSelected && bSelected) {
            return 0;
        }
        if (aSelected) {
            return -1;
        }
        if (bSelected) {
            return 1;
        }
        return 0;
    },

    /**
     * Extracts the feature schema from the first feature in the store.
     * @param  {GeoExt.data.store.Features} store the layer store
     * @return {Array}       an array with the feature attribute names
     */
    extractSchema: function(store) {
        var me = this;
        var columns = [];
        if (this.getAddZoomButton()) {
            columns.push({
                minWidth: 35,
                menuDisabled: true,
                enableColumnHide: false,
                hideable: false,
                sortable: false,
                disabled: true,
                locked: true,
                renderer: function() {
                    return '<span class="fa fa-search" ' +
                        'style="cursor: pointer;"></span>';
                },
                width: 32,
                sorter: this.selectionCompareFunction.bind(this)
            });
        }
        var data = store.getData().items;
        var attributes = [];
        if (data.length > 0) {
            Ext.each(data, function(item) {
                Ext.iterate(item.data, function(key, value) {
                    if (value === undefined || value && value.getExtent ||
                        me.getIgnoredAttributes().indexOf(key) !== -1) {
                        return;
                    }
                    if (attributes.indexOf(key) === -1) {
                        attributes.push(key);
                    }
                });
            });
        }
        Ext.each(attributes, function(attribute) {
            var col = {
                text: attribute,
                dataIndex: attribute,
                filter: me.enableFiltering
            };
            var isIdField = attribute === me.layer.getProperties().idField;
            if (me.enableEditing && !isIdField) {
                col.editor = 'textfield';
            }
            columns.push(col);
        });
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
            this.selectionFeatureAdded
        );
        layer.getSource()[onOrOff](
            'removefeature',
            this.selectionFeatureRemoved
        );
    },

    /**
     * Handler for the save button of the feature grid.
     *
     * @param {Ext.button.Button} btn The clicked button.
     */
    onSaveClick: function(btn) {
        var me = this;
        var vm = me.getViewModel();
        var grid = btn.up('gridpanel');
        grid.setLoading(true);
        var gridStore = grid.getStore();
        var updateFeatures = me.getModifiedFeatures(gridStore);
        var insertFeatures = [];
        var deleteFeatures = [];

        me.performWfst(me.layer, insertFeatures, updateFeatures, deleteFeatures)
            .then(function() {
                gridStore.commitChanges();
                grid.setLoading(false);
            }, function() {
                Ext.toast(vm.get('saveErrorText'));
                grid.setLoading(false);
            });
    },

    /**
     * Perform a WFS-T with lockFeatures.
     *
     * @param {ol.Layer} layer The layer to which the features belong.
     * @param {ol.Feature[]} inserts List of new features.
     * @param {ol.Feature[]} updates List of features to update.
     * @param {ol.Feature[]} deletes List of features to delete.
     * @return {Ext.Promise} Promise with the resolve or rejected transaction.
     */
    performWfst: function(layer, inserts, updates, deletes) {
        return BasiGX.util.WFST.lockFeatures(layer)
            .then(function(response) {
                return BasiGX.util.WFST.handleLockFeaturesResponse(response);
            })
            .then(function(lockId) {
                var opts = {
                    layer: layer,
                    wfstInserts: inserts,
                    wfstUpdates: updates,
                    wfstDeletes: deletes,
                    lockId: lockId
                };
                return BasiGX.util.WFST.transact(opts);
            });
    },

    /**
     * Get the modified features from the gridstore.
     *
     * @param {Ext.data.Store} store The store to get the features from.
     * @return {ol.Feature[]} List of modified store records as features.
     */
    getModifiedFeatures: function(store) {
        var me = this;
        var layerProps = me.layer.getProperties();
        var idField = layerProps.idField;
        var modifiedFeatures = [];

        store.each(function(rec) {
            if (rec.dirty) {
                var modifiedFields = {};
                Ext.Object.each(rec.getData(), function(field, value){
                    if (rec.isModified(field)) {
                        modifiedFields[field] = value;
                    }
                });
                var feature = new ol.Feature(modifiedFields);
                feature.setId(rec.get(idField));
                modifiedFeatures.push(feature);
            }
        }, undefined, {filtered: true});
        return modifiedFeatures;
    }

});
