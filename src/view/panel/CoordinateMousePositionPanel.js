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
 * TODO: docs
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
     * TODO: docs
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
     * TODO: docs
     */
    layout: 'hbox',

    /**
     * TODO: docs
     */
    segmentedButtonLimit: 3,

    /**
     * TODO: fill my documentation
     */
    epsgCodeArray: null,

    /**
     *
     */
    olMap: null,

    /**
     *
     */
    olMousePositionControl: null,

    /**
     *
     */
    coordinateDigitsForUnit: {
        metre: 3,
        degrees: 6
    },

    /**
     *
     */
    coordinateFieldLabelPerUnit: {
        metre: {
            x: 'Easting',
            y: 'Northing'
        },
        degrees: {
            x: 'Longitude',
            y: 'Latitude'
        }
    },

    /**
     * TODO: docs
     */
    initComponent: function () {
        var me = this;

        me.items = [{
            // will be filled as soon as CRS definitions are ready
            name: 'crs-group',
            xtype: 'button',
            hidden: true
        }, {
            // helper component updated by openlayers mouse position control
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
            validator: function (val) {
                return Ext.isNumeric(val);
            }
        }, {
            xtype: 'textfield',
            name: 'yVal',
            bind: {
                value: '{yVal}',
                fieldLabel: '{yLabel}'
            },
            labelAlign: 'right',
            validator: function (val) {
                return Ext.isNumeric(val);
            }
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

        me.on('afterrender', function () {
            me.initOlMouseControl();
            me.initProjections();
        });
        me.callParent(arguments);
    },

    /**
     * TODO: docs
     */
    initProjections: function () {
        var me = this,
            epsgCodeArray = me.epsgCodeArray,
            mapProjection = me.olMap.getView().getProjection().getCode();

        if (!epsgCodeArray) {
            epsgCodeArray = [mapProjection];
        } else {
            epsgCodeArray = Ext.Array.merge(epsgCodeArray, [mapProjection]);
        }

        var projectionInitPromise = BasiGX.util.Projection.
            fetchProj4jCrsDefinitions(epsgCodeArray);
        projectionInitPromise
            .then(function (proj4jObjects) {
                BasiGX.util.Projection.initProj4Definitions(proj4jObjects, me);
                me.generateCrsChangeButtonGroup(proj4jObjects);
            })
            .catch(function () {
                Ext.log.warn('Could not initialize projections');
            });
    },

    /**
     * TODO: docs
     */
    generateCrsChangeButtonGroup: function (proj4jObjects) {
        if (!Ext.isArray(proj4jObjects)) {
            return;
        }

        var me = this,
            isMenu = proj4jObjects.length > me.segmentedButtonLimit,
            cmpCfg;

        if (proj4jObjects.length === 1) {
            // simply add a label
            cmpCfg = {
                xtype: 'label',
                margin: 3,
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

            Ext.each(proj4jObjects, function (projectionDefinition) {
                var code = projectionDefinition.code;
                var name = projectionDefinition.name;
                var unit = projectionDefinition.unit;
                if (unit.indexOf('degree') > -1) {
                    unit = 'degrees';
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
                var mapCode = me.olMap.getView().getProjection().getCode().split(':')[1];
                var filtered = Ext.Array.filter(proj4jObjects, function (obj) {
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
    },

    /**
     * Peter
     */
    onCrsItemClick: function (isMenu, btn, segBtn) {
        var me = this,
            targetCmp = isMenu ? btn : segBtn;

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
     * TODO: docs
     */
    initOlMouseControl: function () {
        var me = this,
            targetComponent = me.down('component[name="mouse-position"]'),
            tagetDivId = targetComponent.getEl().id;
        if (!me.olMap) {
            Ext.log.warn('No Openlayers map found.');
            return;
        }
        me.olMousePositionControl = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(me.coordinateDigitsForUnit.metre),
            projection: me.olMap.getView().getProjection(),
            target: document.getElementById(tagetDivId),
            undefinedHTML: 'NaN,NaN'
        });
        me.olMap.addControl(me.olMousePositionControl);
        var coordElement = Ext.Element.select('div.ol-mouse-position').elements[0];
        var observer = new MutationObserver(function (mutations) {
            if (mutations && mutations.length === 1 && Ext.isTextNode(mutations[0].addedNodes[0])) {
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
     * Update viewModel fields xVal and yVal based on updated passed text content
     *
     * @param {String} textContent result of ol.control.MousePosition
     */
    updateCoordinateFields: function (textContent) {
        var me = this,
            viewModel = me.getViewModel();
        if (!textContent || !Ext.isString(textContent) || textContent.indexOf(',') === -1) {
            return;
        }
        var splittedVal = textContent.split(',');
        if (splittedVal.length !== 2) {
            return;
        }
        if (Number.isNaN(Number(splittedVal[0])) || Number.isNaN(Number(splittedVal[1]))) {
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
     * TODO: docs
     */
    onCenterToCoordinateClick: function () {
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
        me.olMap.getView().setCenter(targetCenter);
    }

});
