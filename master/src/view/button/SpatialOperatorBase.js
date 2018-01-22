/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * Spatial Operator Base Button
 *
 * @class BasiGX.view.button.SpatialOperatorBase
 */
Ext.define('BasiGX.view.button.SpatialOperatorBase', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-spatial-operator-base',

    requires: [
    ],

    /**
     *
     */
    viewModel: {
        data: {
            invalidResultGeometryText: 'The process returned an invalid ' +
                'geometry. Please try again',
            noValidOrNotEnoughGeometriesSelectedText: 'Please select at ' +
                'least 2 valid objects',
            tooManyFeaturesSelectedText: 'Please select {0} objects as ' +
                'maximum. If you want to edit more objects, repeat the ' +
                'operation in multiple steps',
            masterSlaveFeatureDialogTitle: 'Select objects',
            firstFeatureNameInGrid: 'Object 1',
            secondFeatureNameInGrid: 'Object 2',
            firstGridTitle: 'Object to be edited',
            secondGridTitle: 'Helper object',
            gridDescriptionText: 'The objects geometry on the left side will ' +
                'be edited. The object on the right side will remain ' +
                'untouched. Drag and drop objects to switch their assignment',
            startOperationFromGridText: 'Start operation',
            invalidGridSelectionText: 'Invalid selection'
        }
    },

    /**
     *
     */
    // bind: {
    //     text: '{copyObjectBtnText}'
    // },

    config: {
        /**
         * Reference to the selectionVectorLayer
         */
        selectionVectorLayer: null,

        /**
         * Reference to the targetVectorLayer
         */
        targetVectorLayer: null,

        /**
         * if set to true, the selected geometries for the spatial operation
         * will be removed after the operation, as a new one is derived
         */
        removeSelectedGeometriesAfterOperation: true,

        /**
         * copy the attributes of the first selected feature if set to true
         */
        copyAttributesFromFirstSelectedFeature: true,

        /**
         * the number of features which are allowed to process together.
         * Union may use a high number without problems,
         * intersect will be restricted to 2
         */
        maxAllowedFeaturesForOperation: 2,

        /**
         * an array containing the geometries that should be processed
         */
        featureArray: [],

        /**
         * a boolean to indicate that a dialog window should be shown which
         * gives the user the opportunity to select which feature should be
         * used as master and which one as slave for the spatial operation
         */
        showSelectMasterSlaveFeatureDialog: false
    },

    listeners: {
        click: function() {
            this.doProcess();
        }
    },

    /**
     * Main method starting the spatial operation after validating the input
     */
    doProcess: function() {
        var me = this;
        if (!me.getSelectionVectorLayer()) {
            Ext.log.error('No selection layer given, aborting');
            return;
        }

        // push the selected features from the select control
        Ext.each(me.selectionVectorLayer.getSource().
            getFeatures(), function(feature) {
            me.getFeatureArray().push(feature);
        });

        if (me.getFeatureArray().length >
            me.getMaxAllowedFeaturesForOperation()) {
            BasiGX.util.MsgBox.error(Ext.String.format(
                me.getViewModel().get('tooManyFeaturesSelectedText'),
                me.getMaxAllowedFeaturesForOperation()));
            me.setFeatureArray([]);
        } else if (me.getFeatureArray().length >= 2) {
            // check if we have to display a dialog window for processing
            if (me.getShowSelectMasterSlaveFeatureDialog()) {
                me.createSelectMasterSlaveFeatureDialog(me.getFeatureArray());
            } else {
                // do the spatial operation directly
                var newFeature = me.processSelectedGeometries(
                    me.getFeatureArray());
                me.handleOperationResult(newFeature);
            }
        } else {
            BasiGX.util.MsgBox.error(
                me.getViewModel().get(
                    'noValidOrNotEnoughGeometriesSelectedText'));
            me.setFeatureArray([]);
        }
    },

    /**
     * Method used on callback after spatial operation
     *
     * @param {ol.Feature} newFeature The feature generated by the spatial
     *     operation
     */
    handleOperationResult: function(newFeature) {
        var me = this;
        // check for valid geometry
        if (!newFeature) {
            BasiGX.util.MsgBox.error(
                me.getViewModel().get('invalidResultGeometryText'));
            me.cleanup();
            return;
        }
        // copy the attributes from the first selected feature to the
        // new target feature
        if (me.getCopyAttributesFromFirstSelectedFeature()) {
            newFeature = me.copyAttributes(newFeature);
        }
        // add the new feature to the layer
        me.addFeaturesToTargetVectorLayer([newFeature]);
        // remove original geometries after operation
        if (me.getRemoveSelectedGeometriesAfterOperation()) {
            me.removeOriginalOperationFeatures();
        }
        me.cleanup();
    },

    /**
     * Resets the selections and highlights after processing
     */
    cleanup: function() {
        var me = this;
        // reset the geometries Array
        me.setFeatureArray([]);
        // cleanup selections
        if (me.getSelectionVectorLayer()) {
            me.getSelectionVectorLayer().getSource().clear();
        }
        // cleanup highlight features
        if (me.highLightLayer) {
            me.highLightLayer.getSource().clear();
        }
    },

    /**
     * Creates an `Ext.window.Window` to offer the user the option to select
     * which features shall be used in which way during the spatial operation
     *
     * @param {ol.Feature[]} featureArray The array of features to use
     */
    createSelectMasterSlaveFeatureDialog: function(featureArray) {
        var me = this;

        // setting the displayname for the features
        featureArray[0].displayName = me.getViewModel().get(
            'firstFeatureNameInGrid');
        featureArray[1].displayName = me.getViewModel().get(
            'secondFeatureNameInGrid');

        var masterGridStore = Ext.create('Ext.data.Store', {
            fields: ['displayName'],
            data: [featureArray[0]]
        });

        var masterGrid = Ext.create('Ext.grid.Panel', {
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragGroup: 'masterGridDDGroup',
                    dropGroup: 'slaveGridDDGroup'
                },
                listeners: {
                    itemmouseenter: function(scope, record) {
                        me.highlightFeature(record.data);
                    }
                }
            },
            store: masterGridStore,
            columns: [
                {
                    text: me.getViewModel().get('firstGridTitle'),
                    flex: 1,
                    sortable: true,
                    dataIndex: 'displayName'
                }
            ],
            margins: '0 2 0 0'
        });

        var slaveGridStore = Ext.create('Ext.data.Store', {
            fields: ['displayName'],
            data: [featureArray[1]]
        });

        var slaveGrid = Ext.create('Ext.grid.Panel', {
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragGroup: 'slaveGridDDGroup',
                    dropGroup: 'masterGridDDGroup'
                },
                listeners: {
                    itemmouseenter: function(scope, record) {
                        me.highlightFeature(record.data);
                    }
                }
            },
            store: slaveGridStore,
            columns: [
                {
                    text: me.getViewModel().get('secondGridTitle'),
                    flex: 1,
                    sortable: true,
                    dataIndex: 'displayName'
                }
            ],
            margins: '0 0 0 2'
        });

        Ext.create('Ext.window.Window', {
            title: me.getViewModel().get('masterSlaveFeatureDialogTitle'),
            name: 'masterslavefeaturedialogwin',
            width: 450,
            height: 220,
            items: [
                {
                    xtype: 'panel',
                    border: false,
                    bodyPadding: 5,
                    items: [
                        {
                            xtype: 'displayfield',
                            value: me.getViewModel().get('gridDescriptionText')
                        }
                    ]
                },
                {
                    xtype: 'panel',
                    height: 100,
                    border: false,
                    layout: {
                        type: 'hbox',
                        align: 'stretch',
                        padding: 5
                    },
                    defaults: {
                        flex: 1
                    },
                    items: [
                        masterGrid,
                        slaveGrid
                    ]
                }
            ],
            buttons: [{
                text: me.getViewModel().get('startOperationFromGridText'),
                handler: function(btn) {
                    //check if at least one feature is on every side
                    if (masterGridStore.getCount() >= 1 &&
                        slaveGridStore.getCount() >= 1) {
                        // reset the featurearray and reorder it
                        me.setFeatureArray([]);
                        var masterFeature = masterGridStore.getAt(0).data;
                        var slaveFeature = slaveGridStore.getAt(0).data;

                        // mark the second feature to stay after processing
                        slaveFeature.keepFeature = true;

                        me.getFeatureArray().push(masterFeature);
                        me.getFeatureArray().push(slaveFeature);

                        var newFeature = me.processSelectedGeometries(
                            me.getFeatureArray());

                        btn.up('window[name=masterslavefeaturedialogwin]').
                            destroy();
                        me.handleOperationResult(newFeature);
                    } else {
                        BasiGX.util.MsgBox.error(me.getViewModel().get(
                            'invalidGridSelectionText'));
                    }
                }
            }],
            listeners: {
                // remove all hovered features on window close
                'close': function() {
                    if (me.highLightLayer) {
                        me.highLightLayer.getSource().clear();
                    }
                    me.setFeatureArray([]);
                }
            }
        }).showAt(0);
    },

    /**
     * Adds the newly generated features to the targetVectorLayer
     *
     * @param {ol.Feature[]} features The features to add
     */
    addFeaturesToTargetVectorLayer: function(features) {
        var me = this;
        if (me.getTargetVectorLayer()) {
            me.getTargetVectorLayer().getSource().addFeatures(features);
        }
    },

    /**
     * Remove original features after the operation
     */
    removeOriginalOperationFeatures: function() {
        var me = this;
        var layer = me.getTargetVectorLayer();
        if (!layer) {
            return;
        }
        Ext.each(me.getFeatureArray(), function(feature) {
            if (feature.keepFeature) {
                return;
            }
            var match = false;
            Ext.each(layer.getSource().getFeatures(), function(feat) {
                if (feature === feat) {
                    match = true;
                    return false;
                }
            });
            if (match) {
                layer.getSource().removeFeature(feature);
            } else {
                Ext.log.warn('Could not remove an original feature, as the ' +
                    'target and source layer seem to differ');
            }
        });
    },

    /**
     * Copy the attributes of the first selected feature
     * to the new target feature
     *
     * @param {ol.Feature} targetFeature The feature that shall receive
     *     the new attributes
     * @return {ol.Feature} The final feature
     */
    copyAttributes: function(targetFeature) {
        var me = this;
        var firstFeature = me.getFeatureArray()[0];
        Ext.iterate(firstFeature.getProperties(), function(key, val) {
            if (key.toLowerCase() !== 'fid' &&
                key.toLowerCase() !== 'id' &&
                key.toLowerCase() !== 'geometry') {
                // var prop = {};
                // prop[key] = val;
                // targetFeature.setProperties(prop);
                targetFeature.set(key, val);
            }
        });
        return targetFeature;
    },

    /**
     * Highlights a feature
     * @param {ol.Feature} feature The feature to highlight
     */
    highlightFeature: function(feature) {
        if (!this.highLightLayer) {
            this.highLightLayer = new ol.layer.Vector({
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: [255, 255, 0, 1],
                        width: 5
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: [255, 255, 0, 1]
                        })
                    })
                })
            });
            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            this.highLightLayer.set(displayInLayerSwitcherKey, false);
            var map = BasiGX.util.Map.getMapComponent().map;
            map.addLayer(this.highLightLayer);
        }
        this.highLightLayer.getSource().clear();
        this.highLightLayer.getSource().addFeatures([feature]);
    }
});
