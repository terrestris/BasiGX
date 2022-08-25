/* Copyright (c) 2015-present terrestris GmbH & Co. KG
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
 * CoordinateTransform FormPanel
 *
 * Used to show and transform coordinates
 *
 * @class BasiGX.view.form.CoordinateTransform
 */
Ext.define('BasiGX.view.form.CoordinateTransform', {
    extend: 'Ext.form.Panel',
    xtype: 'basigx-form-coordinatetransform',

    requires: [
        'Ext.button.Button',
        'Ext.app.ViewModel',
        'BasiGX.util.CopyClipboard'
    ],

    viewModel: {
        data: {
            coordFieldSetTitle: 'Koordinaten',
            coordXFieldLabel: 'X-Koordinate',
            coordYFieldLabel: 'Y-Koordinate',
            transformBtnText: 'Transformieren',
            resetFormBtnText: 'Zurücksetzen',
            transformBtnToolTip: 'Transformieren',
            copyToClipboardBtnText: 'In Zwischenablage kopieren',
            copyToClipboardButtonToolTip: 'In Zwischenablage kopieren',
            documentation: '<h2>Koordinaten transformieren</h2>• In diesem ' +
                'Dialog können Koordinaten transformiert werden.<br>' +
                '• Geben Sie Koordinaten in die Eingabefelder ein, um sich ' +
                'anschließend den Punkt in der Karte anzeigen zu lassen.<br>' +
                '• Klicken Sie alternativ in die Karte, um sich die ' +
                'jeweiligen Koordinaten anzeigen zu lassen'
        }
    },

    layout: 'form',

    scrollable: 'y',

    /**
     *
     */
    map: null,

    config: {
        /**
         * Array of Objects containing code in EPSG notation and Name to display
         * that should be used:
         * {code: 'EPSG:4326', name: 'WGS84'}
         */
        coordinateSystemsToUse: [],

        /**
         *
         */
        transformCenterOnRender: true
    },

    /**
     *
     */
    initComponent: function() {
        var me = this;
        var crsFieldsets = [];

        //set map
        me.map = BasiGX.util.Map.getMapComponent().getMap();

        if (Ext.isEmpty(me.getCoordinateSystemsToUse())) {
            Ext.log.warn('No coordinatesystems given to Component');
            return;
        }

        Ext.each(me.getCoordinateSystemsToUse(), function(crs) {
            var targetCrs = ol.proj.get(crs.code);
            // first we check if the crs can be used at all
            if (!Ext.isDefined(targetCrs)) {
                Ext.log.warn('The CRS ' + crs.code + ' is not defined, did ' +
                    'you require it?');
                return;
            }

            var fs = {
                xtype: 'fieldset',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                title: crs.name,
                crs: crs.code,
                defaults: {
                    xtype: 'numberfield',
                    decimalSeparator: ',',
                    decimalPrecision: 7,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    value: '',
                    listeners: {
                        focus: me.toggleBtnVisibility,
                        change: me.onCoordinateValueChange
                    }
                },
                items: [{
                    name: 'xcoord',
                    bind: {
                        fieldLabel: '{coordXFieldLabel}'
                    }
                }, {
                    name: 'ycoord',
                    bind: {
                        fieldLabel: '{coordYFieldLabel}'
                    }
                }, {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    defaults: {
                        xtype: 'button'
                    },
                    items: [{
                        name: 'copy',
                        margin: '0 5 0 0',
                        bind: {
                            text: '{copyToClipboardBtnText}',
                            tooltip: '{copyToClipboardButtonToolTip}'
                        },
                        listeners: {
                            boxready: function(btn) {
                                var ccUtil = BasiGX.util.CopyClipboard;
                                btn.setHidden(
                                    !ccUtil.copyToClipboardSupported);
                            }
                        },
                        handler: me.copyCoordinatesToClipboard
                    }, {
                        name: 'transform',
                        bind: {
                            text: '{transformBtnText}',
                            tooltip: '{transformBtnToolTip}'
                        },
                        hidden: true,
                        handler: me.transform
                    }]
                }
                ]
            };
            crsFieldsets.push(fs);
        });

        me.items = [{
            xtype: 'fieldset',
            layout: 'form',
            bind: {
                title: '{coordFieldSetTitle}'
            },
            items: crsFieldsets
        }];

        me.callParent();

        // set the initial values
        me.on('afterrender', function() {
            var transformvectorlayer = BasiGX.util.Layer.getLayerByName(
                'transformvectorlayer');
            if (transformvectorlayer) {
                transformvectorlayer.setVisible(true);
            }

            if (me.getTransformCenterOnRender()) {
                var coordToTransform = me.map.getView().getCenter();
                me.transform(coordToTransform);
            }
        });

        me.map.on('click', me.transform);

        me.on('beforedestroy', function() {
            var transformvectorlayer = BasiGX.util.Layer.getLayerByName(
                'transformvectorlayer');
            if (transformvectorlayer) {
                transformvectorlayer.getSource().clear();
            }
            me.map.un('click', me.transform);
        });
    },

    buttons: [{
        bind: {
            text: '{resetFormBtnText}'
        },
        handler: function(btn) {
            var view = btn.up('basigx-form-coordinatetransform');
            view.reset();
            var transformvectorlayer = BasiGX.util.Layer.getLayerByName(
                'transformvectorlayer');
            transformvectorlayer.getSource().clear();
        }
    }],

    /**
     * Bound to the focus event of the textfields, this handler ensures that
     * only the correct (associated) transform button is visible.
     *
     * @param {Ext.form.fiel.Text} field The textfield.
     */
    toggleBtnVisibility: function(field) {
        var allBtns = Ext.ComponentQuery.query(
            'basigx-form-coordinatetransform button[name=transform]'
        );
        var currentBtn = field.up('fieldset').down('button[name=transform]');
        Ext.each(allBtns, function(btn) {
            btn.setVisible(false);
        });
        currentBtn.setVisible(true);
    },

    /**
     * Transforms the passed coordinates from `mapProjection` to `targetCrs`
     * rounds according to the units of the `targetCrs`.
     *
     * @param {ol.Coordinate} coordToTransform The coordinates to transform.
     * @param {ol.proj.Projection} mapProjection The source projection.
     * @param {ol.proj.Projection} targetCrs The target projection.
     * @return {ol.Coordinate} The transformed and formatted coordinates.
     */
    transformCoords: function(coordToTransform, mapProjection, targetCrs) {
        var transformedCoords = ol.proj.transform(coordToTransform,
            mapProjection, targetCrs);

        if (targetCrs.getUnits() === 'm') {
            // round metric crs coords to decimeters
            transformedCoords[0] = Math.round(
                transformedCoords[0] * 100) / 100;
            transformedCoords[1] = Math.round(
                transformedCoords[1] * 100) / 100;
        } else {
            // round geographic crs coords to decimeters
            transformedCoords[0] = Math.round(
                transformedCoords[0] * 10000000) / 10000000;
            transformedCoords[1] = Math.round(
                transformedCoords[1] * 10000000) / 10000000;
        }

        return transformedCoords;
    },

    /**
     * @param {ol.MapBrowserEvent|ol.Coordinate|Ext.button.Button}
     *     evtOrBtnOrArray The input to transfrom, works with different types.
     */
    transform: function(evtOrBtnOrArray) {
        var coordTransformForm = Ext.ComponentQuery.query(
            'basigx-form-coordinatetransform'
        )[0];
        var mapProjection = coordTransformForm.map.getView().getProjection();
        var fieldSets = coordTransformForm.query('fieldset');
        var transformvectorlayer = BasiGX.util.Layer.getLayerByName(
            'transformvectorlayer'
        );
        var isOlEvt = Ext.isArray(evtOrBtnOrArray.coordinate) &&
            evtOrBtnOrArray.coordinate.length === 2;
        var isCoordArray = Ext.isArray(evtOrBtnOrArray) &&
            evtOrBtnOrArray.length === 2;
        var coords = [];
        var coordsSrs = mapProjection;
        var transformedCoords;

        if (isOlEvt) {
            coords = evtOrBtnOrArray.coordinate;
        } else if (isCoordArray) {
            coords = evtOrBtnOrArray;
        } else {
            var fieldset = evtOrBtnOrArray.up('fieldset');
            coords[0] = fieldset.down('numberfield[name=xcoord]').getValue();
            coords[1] = fieldset.down('numberfield[name=ycoord]').getValue();
            coordsSrs = ol.proj.get(fieldset.crs);
        }

        Ext.each(fieldSets, function(fs) {
            if (!Ext.isEmpty(fs.crs)) {
                if (coordsSrs) {
                    transformedCoords = coordTransformForm.transformCoords(
                        coords, coordsSrs, ol.proj.get(fs.crs));
                } else {
                    transformedCoords = coordTransformForm.transformCoords(
                        coords, mapProjection, ol.proj.get(fs.crs));
                }

                fs.down('numberfield[name=xcoord]').setValue(
                    transformedCoords[0]
                );
                fs.down('numberfield[name=ycoord]').setValue(
                    transformedCoords[1]
                );
            }
        });

        // now show coord on map
        if (!Ext.isDefined(transformvectorlayer)) {
            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;

            transformvectorlayer = new ol.layer.Vector({
                name: 'transformvectorlayer',
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    text: new ol.style.Text({
                        text: '\uf05b',
                        font: 'normal 24px FontAwesome',
                        textBaseline: 'middle',
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 0, 0, 0.7)'
                        })
                    })
                })
            });

            transformvectorlayer.set(displayInLayerSwitcherKey, false);
            coordTransformForm.map.addLayer(transformvectorlayer);
        }

        var transformedMapCoords = ol.proj.transform(
            coords, coordsSrs, mapProjection);

        var feature = new ol.Feature({
            geometry: new ol.geom.Point(transformedMapCoords)
        });
        transformvectorlayer.getSource().clear();
        transformvectorlayer.getSource().addFeatures([feature]);
        // recenter if we were not triggered by click in map
        if (!isOlEvt) {
            coordTransformForm.map.getView().setCenter(transformedMapCoords);
        }
    },

    /**
     * Copies displayed coordinates to the clipboard.
     *
     * @param {Ext.button.Button} btn The clicked copy button
    */
    copyCoordinatesToClipboard: function(btn) {
        var fs = btn.up('fieldset');
        var xVal = fs.down('numberfield[name=xcoord]').getValue();
        var yVal = fs.down('numberfield[name=ycoord]').getValue();
        if (xVal && yVal) {
            BasiGX.util.CopyClipboard.copyTextToClipboard(xVal + ' ' + yVal);
        }
    },

    /**
     * Toggles disabled state of fieldset buttons depending on provided field
     * value.
     *
     * @param {Ext.form.field.Number} numberField Coordinate field
     * @param {Number|null} newValue Current coordinate value
     */
    onCoordinateValueChange: function(numberField, newValue) {
        var fs = numberField.up('fieldset');
        var btns = fs.query('button');
        Ext.each(btns, function(btn) {
            btn.setDisabled(!newValue);
        });
    }

});
