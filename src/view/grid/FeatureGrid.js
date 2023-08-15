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
        'Ext.Component',
        'Ext.container.ButtonGroup',
        'Ext.grid.filters.Filters',
        'Ext.grid.plugin.CellEditing',
        'Ext.util.DelayedTask',
        'BasiGX.util.WFST',
        'BasiGX.view.button.DigitizePoint',
        'BasiGX.view.button.DigitizeLine',
        'BasiGX.view.button.DigitizePolygon',
        'BasiGX.view.button.DigitizeModifyObject',
        'BasiGX.view.button.DigitizeMoveObject',
        'BasiGX.view.button.DigitizeDeleteObject',
        'GeoExt.data.store.Features'
    ],

    viewModel: {
        data: {
            renameButton: 'Umbenennen',
            renameBox: 'Bitte geben Sie den neuen Spaltennamen an:',
            deleteTitle: 'Löschen',
            deleteQuestion: 'Wollen Sie die Spalte wirklich löschen?',
            saveButton: 'Speichern',
            cancelButton: 'Abbrechen',
            reloadButton: 'Neu laden',
            saveErrorText: 'Änderungen konnten nicht gespeichert werden.',
            saveSuccessText: 'Änderungen erfolgreich gespeichert.',
            saveReminderText: 'Sie haben seit über {0}min nicht mehr ' +
                'gespeichert. Bitte speichern Sie regelmäßig.',
            editGeometryButton: 'Geometrie editieren',
            removeGeometryButton: 'Geometrie entfernen',
            moveGeometryButton: 'Geometrie bewegen',
            addPointButton: 'Punkt hinzufügen',
            addLineButton: 'Linie hinzufügen',
            addPolygonButton: 'Polygon hinzufügen',
            featuresWithModifiedGeometries: [],
            featuresWithRemovedGeometries: [],
            // Since a newly created item has no primary key,
            // we will use the store id of the item instead.
            featuresWithAddedGeometries: [],
            isEditing: false,
            showSaveReminder: false,
            saveReminderTask: undefined
        }
    },

    height: 500,

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

        /**
         * Height of grid toolbar. Defaults to 50px.
         */
        gridToolbarHeight: 50,

        /* eslint-enable */
        /**
         * Configures filtering on the grid.
         */
        enableFiltering: false,
        /**
         * Configures the columns that should use numeric filtering.
         * Only applicable if enableFiltering is true.
         */
        numericFilterColumns: [],
        /**
         * Configures editing of the grid.
         */
        enableEditing: false,
        /**
        * Configures the visibility of the refresh button of the grid.
        */
        enableRefreshButton: false,
        /**
         * List of supported geometry types.
         * Following strings are supported:
         *
         * "Point", "MultiPoint", "LineString",
         * "MulitLineString", "Polygon", "MultiPolygon"
         */
        geometryTypes: [],
        /**
         * Allows/disallows renaming a column.
         */
        enableColumnRenaming: true,
        /**
         * Allows/disallows removing a column.
         */
        enableColumnRemoving: true,
        /**
         * Time in ms in which the saveReminder should
         * be shown. Time starts after the first edit.
         * Defaults to 10min.
         */
        saveReminderDelay: 10 * 60 * 1000,
        /**
         * An example GeoJSON feature object that will be used to extract the schema
         * in case no features are in the store.
         */
        exampleFeature: null,
        /**
         * The padding to use when zooming to features. Can be a single number or an array of numbers.
         */
        zoomPadding: 0,
        /**
         * The max zoom to use when zooming to features.
        */
        maxZoom: undefined
    },

    editLayer: undefined,
    items: [],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    constructor: function() {
        var me = this;

        me.selectionFeatureAdded = me.selectionFeatureAdded.bind(me);
        me.selectionFeatureRemoved = me.selectionFeatureRemoved.bind(me);
        me.onChangeFeature = me.onChangeFeature.bind(me);
        me.onAddFeature = me.onAddFeature.bind(me);
        me.onRemoveFeature = me.onRemoveFeature.bind(me);
        me.callParent(arguments);
    },

    /**
     * @event geometrieseditedandsaved
     * Fires when geometries were edited and saved.
     * This can be useful for reloading the original
     * layer, if included as WMS.
     */

    /**
     * @event reloadgrid
     * Fires when the reload button was clicked.
     * This can be used to trigger reloading of
     * the data and updating the grid, accordingly.
     */

    /**
     *
     */
    initComponent: function() {
        var me = this;
        this.callParent();
        var gridHeight = this.height;
        if (this.enableEditing || this.enableRefreshButton) {
            gridHeight = gridHeight - this.getGridToolbarHeight();
        }
        var gridOpts = {
            xtype: 'grid',
            flex: 1,
            height: gridHeight,
            forceFit: true,
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
                            var padding = me.getZoomPadding();
                            if (typeof padding === 'number') {
                                padding = [padding, padding, padding, padding];
                            }
                            if (!padding) {
                                padding = undefined;
                            }
                            var maxZoom = me.getMaxZoom();
                            mapView.fit(record.olObject.getGeometry(), {
                                duration: 300,
                                padding: padding,
                                maxZoom: maxZoom
                            });
                        }
                    }
                }
            }
        };
        this.createEditLayer();
        if (this.enableEditing) {
            this.hideEditLayer();
            this.addEditLayerToMap();
            this.createEditToolbar();
        }
        // if enableEditing is set to false but the refresh button needs
        // to be visible, the toolbar needs to be created to show the
        // refresh button
        if (this.enableRefreshButton && !this.enableEditing) {
            this.createEditToolbar();
        }
        this.add(gridOpts);
        this.setLayerStore();
        this.registerEvents();
        this.createHighlightLayer(this.getMap());
        this.appendMenuEntries();
        this.addListener('beforedestroy', this.onBeforeDestroy.bind(this));
        var grid = this.down('grid');
        grid.on('select', this.rowSelected, this);
        grid.on('deselect', this.rowDeselected, this);

        window.setTimeout(function () {
            // Update the map size when opening the grid
            var map = BasiGX.util.Map.getMapComponent().map;
            map.updateSize();
        }, 100);
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
        var me = this;
        var grid = this.down('grid');
        var viewModel = this.getViewModel();
        var menu = grid.view.headerCt.getMenu();
        if (me.getEnableColumnRenaming()) {
            menu.add(this.getRenameEntry(viewModel));
        }
        if (me.getEnableColumnRemoving()) {
            menu.add(this.getDeleteEntry(viewModel));
        }
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
     * Register all editing events.
     */
    registerEditingEvents: function() {
        var me = this;
        me.editLayer.getSource().on('removefeature', me.onRemoveFeature);
        me.editLayer.getSource().on('addfeature', me.onAddFeature);
    },

    /**
     * Unregister all editing events.
     */
    unregisterEditingEvents: function() {
        var me = this;
        me.editLayer.getSource().un('removefeature', me.onRemoveFeature);
        me.editLayer.getSource().un('addfeature', me.onAddFeature);
    },

    /**
     * Handler for the change feature event.
     * @param {ol.Feature} feature The changed feature.
     */
    onChangeFeature: function(feature) {
        var me = this;
        var vm = me.getViewModel();
        me.startEditingFeature();
        var idField = me.layer.getProperties().idField;
        var featureId = feature.getProperties()[idField];
        var modifiedFeatures = vm.get('featuresWithModifiedGeometries');
        Ext.Array.include(modifiedFeatures, featureId);
        vm.set('featuresWithModifiedGeometries', modifiedFeatures);
    },

    /**
     * Handler for the remove feature event.
     * @param {ol.source.Vector.VectorSourceEvent} evt removefeature
     */
    onRemoveFeature: function(evt) {
        var me = this;
        var vm = me.getViewModel();
        me.startEditingFeature();
        var idField = me.layer.getProperties().idField;
        var featureId = evt.feature.getProperties()[idField];
        var removedFeatures = vm.get('featuresWithRemovedGeometries');
        Ext.Array.include(removedFeatures, featureId);
        vm.set('featuresWithRemovedGeometries', removedFeatures);
    },

    /**
     * Handler for the add feature event.
     */
    onAddFeature: function() {
        var me = this;
        me.startEditingFeature();
    },

    /**
     * Sets the layer store on the grid.
     */
    setLayerStore: function() {
        var me = this;
        var vm = me.getViewModel();
        var store = new GeoExt.data.store.Features({
            layer: this.editLayer,
            listeners: {
                update: function(st, rec, operation) {
                    // We do not want to trigger the editing
                    // when changes were committed.
                    if (operation === 'commit') {
                        return;
                    }
                    me.startEditingFeature();
                },
                add: function(st, recs) {
                    var addedFeatures = vm.get('featuresWithAddedGeometries');
                    Ext.Array.include(addedFeatures, recs[0].getId());
                    vm.set('featuresWithAddedGeometries', addedFeatures);
                }
            }
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
                maxWidth: 35,
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
                sorter: this.selectionCompareFunction.bind(this)
            });
        }
        var data = store.getData().items.slice();
        var attributes = [];
        if (data.length === 0 && this.getExampleFeature()) {
            data.push({
                data: this.getExampleFeature().properties
            });
        }
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
            var idField = me.layer.getProperties().idField;
            var isIdField = attribute === idField;
            if (me.enableEditing && idField && !isIdField) {
                col.editor = 'textfield';
            }
            var isNumericColumn = Ext.Array.contains(me.getNumericFilterColumns(), attribute);
            if (me.enableFiltering && isNumericColumn) {
                col.filter = 'number';
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
     */
    onSaveClick: function() {
        var me = this;
        var vm = me.getViewModel();
        var grid = me.down('gridpanel');
        grid.setLoading(true);
        var gridStore = grid.getStore();
        var updates = me.getModifiedFeatures(gridStore);
        var inserts = me.getAddedFeatures(gridStore);
        var deletes = me.getDeletedFeatures();

        me.performWfst(me.layer, inserts, updates, deletes)
            .then(function() {
                gridStore.commitChanges();
                grid.setLoading(false);
                Ext.toast(vm.get('saveSuccessText'));
                // only update if geometries were edited.
                var shouldUpdate = me.didGeometryChange();
                vm.set('featuresWithModifiedGeometries', []);
                vm.set('featuresWithAddedGeometries', []);
                vm.set('featuresWithRemovedGeometries', []);
                me.finishEditing();
                me.resetAllButtons();
                if (shouldUpdate) {
                    me.fireEvent('geometrieseditedandsaved');
                }
            }, function() {
                Ext.toast(vm.get('saveErrorText'));
                me.finishEditing();
                grid.setLoading(false);
                me.resetAllButtons();
            });
    },

    /**
     * Perform a WFS-T.
     *
     * @param {ol.Layer} layer The layer to which the features belong.
     * @param {ol.Feature[]} inserts List of new features.
     * @param {ol.Feature[]} updates List of features to update.
     * @param {ol.Feature[]} deletes List of features to delete.
     * @return {Ext.Promise} Promise with the resolve or rejected transaction.
     */
    performWfst: function(layer, inserts, updates, deletes) {
        var opts = {
            layer: layer,
            wfstInserts: inserts,
            wfstUpdates: updates,
            wfstDeletes: deletes
        };
        return BasiGX.util.WFST.transact(opts);
    },

    /**
     * Get the modified features from the gridstore.
     *
     * @param {Ext.data.Store} store The store to get the features from.
     * @return {ol.Feature[]} List of modified store records as features.
     */
    getModifiedFeatures: function(store) {
        var me = this;
        var vm = me.getViewModel();
        var layerProps = me.layer.getProperties();
        var idField = layerProps.idField;
        var modifiedFeatures = [];

        store.each(function(rec) {
            var isNewFeature = !Ext.isDefined(rec.get(idField));
            if (isNewFeature) {
                return;
            }
            var isModified = false;
            var modifiedFields = {};
            var featureId = rec.get(idField);
            var containsFeature = Ext.Array.contains(
                vm.get('featuresWithModifiedGeometries'), featureId);
            if (containsFeature) {
                modifiedFields.geometry = me.getEditGeometryForFeature(
                    featureId);
                isModified = true;
            }
            if (rec.dirty) {
                Ext.Object.each(rec.getData(), function(field, value){
                    if (rec.isModified(field)) {
                        modifiedFields[field] = value;
                    }
                });
                isModified = true;
            }
            if (isModified) {
                var feature = new ol.Feature(modifiedFields);
                feature.setId(rec.get(idField));
                modifiedFeatures.push(feature);
            }
        }, undefined, {filtered: true});
        return modifiedFeatures;
    },

    /**
     * Get the deleted features from the original layer.
     *
     * @return {ol.Feature[]} List of features to delete.
     */
    getDeletedFeatures: function() {
        var me = this;
        var vm = me.getViewModel();
        var layerProps = me.layer.getProperties();
        var idField = layerProps.idField;
        var deletedFeatures = [];

        var features = me.layer.getSource().getFeatures();
        Ext.Array.each(features, function(feature) {
            var featureId = feature.get(idField);
            var containsFeature = Ext.Array.contains(
                vm.get('featuresWithRemovedGeometries'), featureId);
            if (containsFeature) {
                var f = new ol.Feature();
                f.setId(feature.get(idField));
                deletedFeatures.push(f);
            }
        });
        return deletedFeatures;
    },

    /**
     * Get the added features from the store.
     *
     * @param {Ext.data.Store} store The store to get the features from.
     * @return {ol.Feature[]} List of features to add.
     */
    getAddedFeatures: function(store) {
        var me = this;
        var vm = me.getViewModel();
        var newFeatures = [];
        store.each(function(rec) {
            var recordId = rec.getId();
            var containsFeature = Ext.Array.contains(
                vm.get('featuresWithAddedGeometries'), recordId);
            if (containsFeature) {
                var data = Ext.Object.merge({}, rec.getData());
                delete data.id;
                var feature = new ol.Feature(data);
                newFeatures.push(feature);
            }
        });
        return newFeatures;
    },

    /**
     * Check if any geometry did change.
     *
     * @return {boolean} True, if geometry did change. False otherwise.
     */
    didGeometryChange: function() {
        var me = this;
        var vm = me.getViewModel();
        var wasModified = vm.get('featuresWithModifiedGeometries').length > 0;
        var wasAdded = vm.get('featuresWithAddedGeometries').length > 0;
        var wasRemoved = vm.get('featuresWithRemovedGeometries').length > 0;
        return wasModified || wasAdded || wasRemoved;
    },

    /**
     * Creates the editLayer based on the features of this.layer.
     */
    createEditLayer: function() {
        var me = this;
        var features = me.layer.getSource().getFeatures();
        var featureClones = Ext.Array.map(features, function(feature) {
            return feature.clone();
        });
        var source = new ol.source.Vector({
            features: new ol.Collection(featureClones)
        });
        var editLayer = new ol.layer.Vector({
            source: source
        });
        editLayer.setStyle(me.layer.getStyle());
        editLayer.set(BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER, false);
        me.editLayer = editLayer;
        me.registerEditingEvents();
    },

    /**
     * Remove the editLayer from the map and unregister
     * the editing events.
     */
    removeEditLayer: function() {
        var me = this;
        var mapComponent = BasiGX.util.Map.getMapComponent();
        var map = mapComponent.map;
        map.removeLayer(me.editLayer);
        me.unregisterEditingEvents();
    },

    /**
     * Gets the geometry for the feature in the editLayer that
     * corresponds to the given featureId.
     * @param {Number} featureId The id to filter by.
     * @return {o.geom.Geometry} The matching geometry.
     */
    getEditGeometryForFeature: function(featureId) {
        var me = this;
        var idField = me.layer.getProperties().idField;
        var features = me.editLayer.getSource().getFeatures();
        var foundFeature = Ext.Array.findBy(features, function(feature) {
            return feature.getProperties()[idField] === featureId;
        });
        if (!foundFeature) {
            return;
        }
        return foundFeature.getGeometry().clone();
    },

    /**
     * Add the editLayer to the map.
     */
    addEditLayerToMap: function() {
        var me = this;
        var mapComponent = BasiGX.util.Map.getMapComponent();
        var map = mapComponent.map;
        map.addLayer(me.editLayer);
    },

    /**
     * Show the editLayer.
     */
    showEditLayer: function() {
        var me = this;
        me.editLayer.setOpacity(1);
    },

    /**
     * Hide the editLayer.
     */
    hideEditLayer: function() {
        var me = this;
        me.editLayer.setOpacity(0);
    },

    /**
     * The handler for the beforedestroy event.
     */
    onBeforeDestroy: function() {
        var me = this;
        var vm = me.getViewModel();

        if (me.enableEditing) {
            me.removeEditLayer();
            me.editLayer = undefined;
        }

        var task = vm.get('saveReminderTask');
        if (task) {
            task.cancel();
        }

        window.setTimeout(function () {
            // Update the map size when closing the grid
            var map = BasiGX.util.Map.getMapComponent().map;
            map.updateSize();
        }, 100);
    },

    /**
     * Get the cellediting plugin of the grid.
     *
     * @return {Ext.grid.plugin.CellEditing} The cellediting plugin, if found.
     */
    getCellEditingPlugin: function() {
        var me = this;
        var grid = me.down('grid');
        var plugins = grid.getPlugins();
        var editingPluginIdx = Ext.Array.findBy(plugins, function(plugin) {
            return plugin.ptype === 'cellediting';
        });
        if (editingPluginIdx === -1) {
            return;
        }
        return plugins[editingPluginIdx];
    },

    /**
     * Completes any occuring editing in the table
     */
    completeTableEditing: function() {
        var me = this;
        var editPlugin = me.getCellEditingPlugin();
        if (editPlugin) {
            editPlugin.completeEdit();
        }
    },

    startEditingFeature: function() {
        var me = this;
        var vm = me.getViewModel();
        vm.set('isEditing', true);
        var task = new Ext.util.DelayedTask(function() {
            vm.set('showSaveReminder', true);
        });
        task.delay(me.getSaveReminderDelay());
        vm.set('saveReminderTask', task);
    },

    finishEditing: function() {
        var me = this;
        var vm = me.getViewModel();
        vm.set('isEditing', false);
        var task = vm.get('saveReminderTask');
        if (task) {
            task.cancel();
        }
        vm.set('saveReminderTask', undefined);
        vm.set('showSaveReminder', false);
    },

    /**
     * The handler for the cancel button.
     */
    onCancelClick: function() {
        var me = this;
        var vm = me.getViewModel();
        vm.set('featuresWithModifiedGeometries', []);
        vm.set('featuresWithRemovedGeometries', []);
        vm.set('featuresWithAddedGeometries', []);
        me.finishEditing();
        me.completeTableEditing();
        me.removeEditLayer();
        me.createEditLayer();
        me.addEditLayerToMap();
        me.hideEditLayer();
        me.removeEditToolbar();
        me.createEditToolbar();
        this.setLayerStore();
    },

    onReloadClick: function() {
        var me = this;
        me.fireEvent('reloadgrid');
    },

    /**
     * Handler for the editing buttons.
     * @param {Ext.button.Button} btn The clicked button.
     */
    onEditButtonClick: function(btn) {
        var me = this;
        if (btn.pressed) {
            me.showEditLayer();
        } else {
            me.hideEditLayer();
        }
    },

    /**
     * Resets all buttons to a their initial state.
     */
    resetAllButtons: function() {
        var me = this;
        me.down('basigx-button-digitize-delete-object').setPressed(false);
        me.down('basigx-button-digitize-modify-object').setPressed(false);
        me.down('basigx-button-digitize-point').setPressed(false);
        me.down('basigx-button-digitize-line').setPressed(false);
        me.down('basigx-button-digitize-polygon').setPressed(false);
    },

    /**
     * Create the edit toolbar.
     */
    createEditToolbar: function() {
        var me = this;

        var editTools = {
            xtype: 'buttongroup',
            height: this.getGridToolbarHeight(),
            tbar: [{
                xtype: 'button',
                name: 'featuregrid-reload-btn',
                bind: {
                    text: '{reloadButton}',
                    disabled: '{isEditing}'
                },
                handler: me.onReloadClick.bind(me)
            }, ' ']
        };

        if (me.enableEditing) {
            var vm = me.getViewModel();
            var layerProps = me.layer.getProperties();
            var idField = layerProps.idField;
            var map = BasiGX.util.Map.getMapComponent().map;
            var collection = this.editLayer.getSource().getFeaturesCollection();
            var containsPoint = Ext.Array.contains(this.geometryTypes, 'Point');
            var containsMultiPoint = Ext.Array.contains(
                this.geometryTypes, 'MultiPoint');
            var containsLine = Ext.Array.contains(this.geometryTypes,
                'LineString');
            var containsMultiLine = Ext.Array.contains(
                this.geometryTypes, 'MultiLineString');
            var containsPolygon = Ext.Array.contains(this.geometryTypes,
                'Polygon');
            var containsMultiPolygon = Ext.Array.contains(
                this.geometryTypes, 'MultiPolygon');

            var pointTool = {
                xtype: 'basigx-button-digitize-point',
                map: map,
                layer: me.editLayer,
                glyph: 'xf100@Flaticon',
                handler: me.onEditButtonClick.bind(me),
                multi: false,
                viewModel: {
                    data: {
                        tooltip: vm.get('addPointButton'),
                        digitizePointText: ''
                    }
                }
            };
            if ((!containsPoint && !containsMultiPoint) || !idField) {
                pointTool.disabled = true;
            }
            if (containsMultiPoint) {
                pointTool.multi = true;
            }
            editTools.tbar.push(pointTool);

            var lineTool = {
                xtype: 'basigx-button-digitize-line',
                map: map,
                layer: me.editLayer,
                glyph: 'xf104@Flaticon',
                multi: false,
                handler: me.onEditButtonClick.bind(me),
                viewModel: {
                    data: {
                        tooltip: vm.get('addLineButton'),
                        digitizeLineText: ''
                    }
                }
            };
            if ((!containsLine && !containsMultiLine) || !idField) {
                lineTool.disabled = true;
            }
            if (containsMultiLine) {
                lineTool.multi = true;
            }
            editTools.tbar.push(lineTool);

            var polygonTool = {
                xtype: 'basigx-button-digitize-polygon',
                map: map,
                layer: me.editLayer,
                glyph: 'xf107@Flaticon',
                multi: false,
                handler: me.onEditButtonClick.bind(me),
                viewModel: {
                    data: {
                        digitizePolygonText: '',
                        tooltip: vm.get('addPolygonButton')
                    }
                }
            };
            if ((!containsPolygon && !containsMultiPolygon) || !idField) {
                polygonTool.disabled = true;
            }
            if (containsMultiPolygon) {
                polygonTool.multi = true;
            }
            editTools.tbar.push(polygonTool);

            var deleteTool = {
                xtype: 'basigx-button-digitize-delete-object',
                map: map,
                collection: collection,
                glyph: 'xf12d@FontAwesome',
                handler: me.onEditButtonClick.bind(me),
                viewModel: {
                    data: {
                        deleteObjectBtnText: '',
                        tooltip: vm.get('removeGeometryButton')
                    }
                }
            };
            if (!idField) {
                deleteTool.disabled = true;
            }
            editTools.tbar.push(deleteTool);

            var moveTool = {
                xtype: 'basigx-button-digitize-move-object',
                collection: collection,
                map: map,
                glyph: 'xf108@Flaticon',
                handler: me.onEditButtonClick.bind(me),
                viewModel: {
                    data: {
                        moveObjectBtnText: '',
                        tooltip: vm.get('moveGeometryButton')
                    }
                },
                listeners: {
                    featurechanged: function(evt) {
                        var feature = evt.features.getArray()[0];
                        me.onChangeFeature(feature);
                    }
                }
            };
            if (!idField) {
                moveTool.disabled = true;
            }
            editTools.tbar.push(moveTool);

            var modifyTool = {
                xtype: 'basigx-button-digitize-modify-object',
                map: map,
                collection: collection,
                glyph: 'xf044@FontAwesome',
                handler: me.onEditButtonClick.bind(me),
                viewModel: {
                    data: {
                        modifyObjectBtnText: '',
                        tooltip: vm.get('editGeometryButton')
                    }
                },
                listeners: {
                    featurechanged: function(evt) {
                        var feature = evt.features.getArray()[0];
                        me.onChangeFeature(feature);
                    }
                }
            };
            if (!idField) {
                modifyTool.disabled = true;
            }
            editTools.tbar.push(modifyTool);

            editTools.tbar.push(' ');
            editTools.tbar.push({
                xtype: 'button',
                name: 'featuregrid-cancel-btn',
                bind: {
                    text: '{cancelButton}',
                    disabled: '{!isEditing}'
                },
                handler: me.onCancelClick.bind(me)
            });
            editTools.tbar.push({
                xtype: 'button',
                name: 'featuregrid-save-btn',
                bind: {
                    text: '{saveButton}',
                    disabled: '{!isEditing}'
                },
                handler: me.onSaveClick.bind(me)
            });
            var saveReminderText = vm.get('saveReminderText');
            var delay = me.getSaveReminderDelay();
            var delayInMinutes = Math.floor(delay / 1000 / 60);

            saveReminderText = Ext.String.format(saveReminderText,
                delayInMinutes);
            editTools.tbar.push({
                xtype: 'component',
                bind: {
                    hidden: '{!showSaveReminder}',
                    html: '<b style="color: red;">' + saveReminderText + '</b>'
                }
            });
        }
        me.insert(0, editTools);
    },

    /**
     * Remove the edit toolbar.
     */
    removeEditToolbar: function() {
        var me = this;
        var editToolbar = me.down('buttongroup');
        me.remove(editToolbar);
    }

});
