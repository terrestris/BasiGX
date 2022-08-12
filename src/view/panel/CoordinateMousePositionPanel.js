/* Copyright (c) 2018-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 *
 * BasiGX.view.panel.CoordinateMousePositionPanel
 *
 * A panel holding information on currently used CRS and mouse position. This
 * can be added to app footer, for example
 *
 * This class uses the MutationObserver interface
 * (https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
 * to listen to changes in DOM performed by ol.control.MousePosition. It's
 * supported by most browsers. If a polyfill is needed, it can be found here:
 * https://cdn.polyfill.io/v2/polyfill.min.js?features=MutationObserver%7Calways
 *
 * @class BasiGX.view.panel.CoordinateMousePositionPanel
 */
Ext.define('BasiGX.view.panel.CoordinateMousePositionPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'basigx-panel-coordinatemouseposition',

    requires: [
        'Ext.button.Segmented',

        'BasiGX.view.component.Map',
        'BasiGX.util.Projection'
    ],

    /**
     * The viewModel definition
     */
    viewModel: {
        data: {
            xVal: NaN,
            yVal: NaN,
            xLabel: 'Easting',
            yLabel: 'Northing',
            srsName: '',
            centerTooltip: 'Center map to coordinates'
        }
    },

    /**
     * The used layout
     */
    layout: 'hbox',

    /**
     * Threshold above which a button menu will be created and not a segmented
     * button
     */
    segmentedButtonLimit: 3,

    /**
     * The array of EPSG codes to be available in segmented button group or
     * button menu
     */
    epsgCodeArray: null,

    /**
     * @cfg {String} activeEpsgCode
     *
     * The initially active EPSG code. Has to be an element of #epsgCodeArray.
     * Otherwise the last element in the list is set as active code.
     */
    activeEpsgCode: null,

    /**
     * The OpenLayers map
     */
    olMap: null,

    /**
     * The layer for the marker
     */
    markerLayer: null,

    /**
     * True, if marker should be shown at coordinate.
     * False otherwise.
     */
    showMarker: false,

    /**
     * Optional style for the marker.
     */
    markerStyle: null,

    /**
     * The OpenLayers MousePosition control
     */
    olMousePositionControl: null,

    /**
     * Object holding number of digits to be shown depending on unit of
     * projection system
     */
    coordinateDigitsForUnit: {
        meter: 3,
        degrees: 6
    },

    /**
     * Object holding field labels depending on unit of projection system
     */
    coordinateFieldLabelPerUnit: {
        meter: {
            x: 'Easting',
            y: 'Northing'
        },
        degrees: {
            x: 'Longitude',
            y: 'Latitude'
        }
    },

    /**
     * Whether the textfields shall update, which is undesired while typing in
     * the textfields. Listeners for `focus` and `blur` ensure that this will be
     * `false` when a coordinate field has the focus and `true` if the field is
     * not focused.
     *
     * @private
     * @type {Boolean}
     */
    updateTextfields: true,

    listeners: {
        /**
         * Removes the marker from the map.
         */
        'removeMarker': function() {
            var me = this;
            if (me.markerLayer) {
                me.markerLayer.getSource().clear();
            }

        },
        /**
         * Checks if given feature is our map marker.
         * @param {ol.Feature} feat The feature to check.
         * @return {boolean} True, if feature is our map marker.
         * False otherwise.
         */
        'isMapMarker': function(feat) {
            var me = this;
            return me.isMapMarker(feat);
        }
    },

    /**
     * The initialization function
     */
    initComponent: function() {
        var me = this;

        me.items = [{
            // will be filled as soon as CRS definitions are ready
            name: 'crs-group',
            xtype: 'button',
            hidden: true
        }, {
            // helper component updated by OpenLayers mouse position control
            name: 'mouse-position',
            hidden: true,
            xtype: 'component'
        }, {
            xtype: 'textfield',
            name: 'xVal',
            bind: {
                value: '{xVal}',
                fieldLabel: '{xLabel}'
            },
            labelAlign: 'right',
            listeners: {
                focus: me.stopUpdating,
                blur: me.resumeUpdating,
                scope: me
            },
            validator: Ext.isNumeric
        }, {
            xtype: 'textfield',
            name: 'yVal',
            bind: {
                value: '{yVal}',
                fieldLabel: '{yLabel}'
            },
            labelAlign: 'right',
            listeners: {
                focus: me.stopUpdating,
                blur: me.resumeUpdating,
                scope: me
            },
            validator: Ext.isNumeric
        }, {
            xtype: 'button',
            margin: '0 0 0 5',
            glyph: 'xf192@FontAwesome',
            bind: {
                tooltip: '{centerTooltip}'
            },
            handler: me.onCenterToCoordinateClick,
            scope: me
        }];

        if (!me.olMap && !(me.olMap instanceof ol.Map)) {
            // guess map
            var mapPanel = BasiGX.view.component.Map.guess();
            me.olMap = mapPanel ? mapPanel.map : null;
        }

        me.on('afterrender', function() {
            me.initOlMouseControl();
            me.initProjections();
            me.initCenter();
        });
        me.callParent();
    },

    /**
     * Stop updating the textfields for the coordinates, e.g. when a coordinate
     * textfield has the focus.
     */
    stopUpdating: function() {
        this.updateTextfields = false;
    },

    /**
     * Resume a previously stopped updating of the textfields for the
     * coordinates, e.g. when a coordinate textfield has lost the focus.
     */
    resumeUpdating: function() {
        this.updateTextfields = true;
    },

    /**
     * Initilization of projections using BasiGX.util.Projection for passed
     * EPSG codes / currently active projection in map
     */
    initProjections: function() {
        var me = this;
        var epsgCodeArray = me.epsgCodeArray;
        var mapProjection = me.olMap.getView().getProjection().getCode();

        if (!epsgCodeArray) {
            epsgCodeArray = [mapProjection];
        } else {
            epsgCodeArray = Ext.Array.merge(epsgCodeArray, [mapProjection]);
        }

        var projectionInitPromise = BasiGX.util.Projection.
            fetchProj4jCrsDefinitions(epsgCodeArray);
        var failureFunction = function() {
            Ext.log.warn('Could not initialize projections');
        };
        projectionInitPromise
            .then(function(proj4jObjects) {
                BasiGX.util.Projection.initProj4Definitions(proj4jObjects, me);
                me.generateCrsChangeButtonGroup(proj4jObjects);
            }, failureFunction);
    },

    /**
     * Generate UI depending on number of passed EPSG codes
     *
     * @param {Object[]} proj4jObjects An array of objects returned by
     *        https://epsg.io which includes information on projection, in
     *        particular the name, the unit and the proj4 definition
     */
    generateCrsChangeButtonGroup: function(proj4jObjects) {
        if (!Ext.isArray(proj4jObjects)) {
            return;
        }

        var me = this;
        var isMenu = proj4jObjects.length > me.segmentedButtonLimit;
        var cmpCfg;

        if (proj4jObjects.length === 1) {
            // simply add a label
            cmpCfg = {
                xtype: 'label',
                text: proj4jObjects[0].name
            };
        } else {
            cmpCfg = {
                xtype: isMenu ? 'button' : 'segmentedbutton',
                name: 'crs-group',
                items: isMenu ? undefined : [],
                menu: isMenu ? [] : undefined,
                bind: {
                    text: isMenu ? '{srsName}' : null
                }
            };

            Ext.each(proj4jObjects, function(projectionDefinition) {
                var code = projectionDefinition.code;
                var name = projectionDefinition.name;
                var unit = projectionDefinition.unit;
                if (unit.indexOf('degree') > -1) {
                    unit = 'degrees';
                }
                if (unit.indexOf('metre') > -1) {
                    unit = 'meter';
                }
                var itemCfg = {
                    text: name,
                    epsgCode: 'EPSG:' + code,
                    epsgUnit: unit
                };
                if (isMenu) {
                    itemCfg.handler = me.onCrsItemClick.bind(me, isMenu);
                    cmpCfg.menu.push(itemCfg);
                } else {
                    cmpCfg.items.push(itemCfg);
                }
            });

            if (!isMenu) {
                cmpCfg.listeners = {
                    toggle: me.onCrsItemClick.bind(me, isMenu)
                };
            } else {
                // update view model to set correct CRS name of map
                var mapCode = me.olMap.getView().getProjection().getCode()
                    .split(':')[1];
                var filtered = Ext.Array.filter(proj4jObjects, function(obj) {
                    return obj.code === mapCode;
                });
                me.getViewModel().setData({
                    srsName: filtered ? filtered[0].name : ''
                });
            }
        }

        var cmpToRemove = me.down('component[name="crs-group"]');
        me.remove(cmpToRemove);
        me.insert(0, cmpCfg);

        // set initial active CRS due to configuration
        var targetCmp = isMenu ? me.down('button') : me.down('segmentedbutton');
        var targetItems = isMenu ? targetCmp.getMenu().items : targetCmp.items;
        var index = targetItems.findIndex('epsgCode', me.activeEpsgCode);
        if (index >= 0) {
            me.onCrsItemClick(isMenu, targetItems.getAt(index),
                targetItems.getAt(index));
        }
    },

    /**
     * Click handler if CRS changed
     * @param {Boolean} isMenu If the CRS selection component is a menu button
     *                  or not
     * @param {Ext.Component} btn The menu button that was clicked
     *                        (if isMenu = true)
     * @param {Ext.Component} segBtn The button in segmented button that was
     *                        clicked (if isMenu = true)
     */
    onCrsItemClick: function(isMenu, btn, segBtn) {
        var me = this;
        var targetCmp = isMenu ? btn : segBtn;
        var targetCode = targetCmp.epsgCode;
        var targetUnit = targetCmp.epsgUnit;
        var srsName = targetCmp.text;
        // update control
        me.olMousePositionControl.setProjection(targetCode);
        me.olMousePositionControl.setCoordinateFormat(
            ol.coordinate.createStringXY(me.coordinateDigitsForUnit[targetUnit])
        );
        me.getViewModel().setData({
            srsName: srsName,
            xLabel: me.coordinateFieldLabelPerUnit[targetUnit].x,
            yLabel: me.coordinateFieldLabelPerUnit[targetUnit].y
        });
    },

    /**
     * Initializes ol.control.MousePosition
     */
    initOlMouseControl: function() {
        var me = this;
        var targetComponent = me.down('component[name="mouse-position"]');
        var targetDivId = targetComponent.getEl().id;
        if (!me.olMap) {
            Ext.log.warn('No OpenLayers map found.');
            return;
        }
        me.olMousePositionControl = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(
                me.coordinateDigitsForUnit.meter
            ),
            projection: me.olMap.getView().getProjection(),
            target: document.getElementById(targetDivId),
            undefinedHTML: 'NaN,NaN'
        });
        me.olMap.addControl(me.olMousePositionControl);
        var coordElement = Ext.Element.select('div.ol-mouse-position')
            .elements[0];
        // register MutationObserver on node to get changed in DOM triggered by
        // OpenLayers
        var observer = new MutationObserver(function(mutations) {
            if (mutations && mutations.length === 1 &&
                Ext.isTextNode(mutations[0].addedNodes[0])) {
                // update textfields
                var textContent = mutations[0].addedNodes[0].textContent;
                me.updateCoordinateFields(textContent.trim());
            }
        });
        observer.observe(coordElement, {
            childList: true
        });
    },

    /**
     * Initializes the text boxes with the map's initial center
     */
    initCenter: function() {
        var me = this;
        if (me.olMap) {
            var center = me.olMap.getView().getCenter();
            center = ol.proj.transform(center,
                me.olMousePositionControl.getProjection(),
                me.olMap.getView().getProjection());

            me.getViewModel().setData({
                xVal: center[0],
                yVal: center[1]
            });
        }
    },

    /**
     * Update viewModel fields xVal and yVal based on updated passed text
     * content
     *
     * @param {String} textContent result of ol.control.MousePosition
     */
    updateCoordinateFields: function(textContent) {
        var me = this;
        if (!me.updateTextfields) {
            return;
        }
        var viewModel = me.getViewModel();
        if (!textContent || !Ext.isString(textContent) ||
            textContent.indexOf(',') === -1) {
            return;
        }
        var splittedVal = textContent.split(',');
        if (splittedVal.length !== 2) {
            return;
        }
        if (!Ext.isNumber(Number(splittedVal[0])) ||
            !Ext.isNumber(Number(splittedVal[1]))) {
            return;
        }
        var xVal = Number(splittedVal[0]);
        var yVal = Number(splittedVal[1]);
        viewModel.setData({
            xVal: xVal,
            yVal: yVal
        });
    },

    /**
     * Handler called if map should be centered on coordinate entered in
     * coordinate input fields
     */
    onCenterToCoordinateClick: function() {
        var me = this;
        var viewModel = me.getViewModel();
        var xVal = viewModel.get('xVal');
        var yVal = viewModel.get('yVal');

        if (!Ext.isNumeric(xVal) || !Ext.isNumeric(yVal)) {
            return;
        }

        // transform to map projection
        var targetCenter = ol.proj.transform(
            [Number.parseFloat(xVal), Number.parseFloat(yVal)],
            me.olMousePositionControl.getProjection(),
            me.olMap.getView().getProjection()
        );
        if (me.showMarker) {
            me.showMarkerOnMap(targetCenter);
        }
        me.olMap.getView().setCenter(targetCenter);
    },

    /**
     * Places a marker on the map.
     *
     * @param {[number, number]} position The position for the marker.
     */
    showMarkerOnMap: function(position) {
        var me = this;
        if (!me.markerLayer) {
            var source = new ol.source.Vector();
            var style = undefined;
            if (me.markerStyle) {
                style = me.markerStyle;
            }
            me.markerLayer = new ol.layer.Vector({
                source: source,
                style: style
            });
            me.olMap.addLayer(me.markerLayer);
        }
        var markerSource = me.markerLayer.getSource();
        var feature = new ol.Feature({
            geometry: new ol.geom.Point(position)
        });
        markerSource.clear();
        markerSource.addFeature(feature);
    },

    /**
     * Checks if a given feature is our map marker.
     *
     * @param {ol.Feature} feat The feature to check.
     * @return {boolean} True, if feature is our map marker. False otherwise.
     */
    isMapMarker: function(feat) {
        var me = this;
        if (!me.markerLayer) {
            return false;
        }
        var source = me.markerLayer.getSource();
        if (!source) {
            return false;
        }
        return source.getFeatures()[0] === feat;
    }

});
