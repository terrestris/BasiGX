/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 */
Ext.define("BasiGX.view.form.CoordinateTransform", {
    extend: "Ext.form.Panel",
    xtype: 'basigx-form-coordinatetransform',

    requires: [
        'Ext.button.Button'
    ],

    viewModel: {
        data: {
        }
    },

    padding: 5,
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    scrollable: true,

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

        var me = this,
            crsFieldsets = [],
            map = Ext.ComponentQuery.query('basigx-component-map')[0].getMap();

        if (Ext.isEmpty(me.getCoordinateSystemsToUse())) {
            Ext.log.warn('No coordinatesystems given to Component');
            return;
        }

        Ext.each(me.getCoordinateSystemsToUse(), function(crs) {
            var targetCrs = ol.proj.get(crs.code);
            // first we check if the crs can be used at all
            if (!Ext.isDefined(targetCrs)) {
                Ext.log.warn('The CRS ' + crs.code + ' is not defined, did you ' +
                   'require it?');
                return;
            }

            var fs = {
                xtype: 'fieldset',
                title: crs.name,
                crs: crs.code,
                margin: 5,
                items: [
                    {
                        xtype: 'numberfield',
                        name: 'xcoord',
                        decimalSeparator: ',',
                        decimalPrecision: 7,
                        fieldLabel: 'X-Koordinate',
                        value: '',
                        // Remove spinner buttons, and arrow key and mouse wheel listeners
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        listeners: {
                            'focus': me.toggleBtnVisibility
                        }
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        margin: '0 0 5 0',
                        items: [{
                            xtype: 'numberfield',
                            name: 'ycoord',
                            decimalSeparator: ',',
                            decimalPrecision: 7,
                            fieldLabel: 'Y-Koordinate',
                            value: '',
                            // Remove spinner buttons, and arrow key and mouse wheel listeners
                            hideTrigger: true,
                            keyNavEnabled: false,
                            mouseWheelEnabled: false,
                            listeners: {
                                'focus': me.toggleBtnVisibility
                            }
                         }, {
                            xtype: 'button',
                            name: 'transform',
                            margin: '0 0 0 30',
                            width: 110,
                            text: 'Transformieren',
                            hidden: true,
                            handler: me.transform
                        }]
                    }
                ]
            };
            crsFieldsets.push(fs);
        });

        me.items = [
            {
                xtype: 'fieldset',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                title: 'Koordinaten',
                items: crsFieldsets
            }
        ];

        me.callParent();

        // set the initial values
        me.on('afterrender', function(){
            var transformvectorlayer = BasiGX.util.Layer.getLayerByName(
                'transformvectorlayer');
            if(transformvectorlayer){
                transformvectorlayer.setVisible(true);
            }

            if(me.getTransformCenterOnRender()){
                var coordToTransform = map.getView().getCenter();
                me.transform(coordToTransform);
            }
        });

        map.on('click', me.transform);

        me.on('beforedestroy', function(){
            var transformvectorlayer = BasiGX.util.Layer.getLayerByName(
                'transformvectorlayer');
            transformvectorlayer.getSource().clear();
            map.un('click', me.transform);
        });
    },

    // Reset and Submit buttons
    buttons: [{
        text: 'Zurücksetzen',
        handler: function(btn){
            var view = btn.up('basigx-form-coordinatetransform');
            view.reset();
            var transformvectorlayer = BasiGX.util.Layer.getLayerByName(
                'transformvectorlayer');
            transformvectorlayer.getSource().clear();
        }
    }],

    /**
     *
     */
    toggleBtnVisibility: function(field) {
        var allBtns = Ext.ComponentQuery.query(
                'basigx-form-coordinatetransform button[name=transform]'),
            currentBtn = field.up('fieldset').down('button[name=transform]');
        Ext.each(allBtns, function(btn) {
            btn.setVisible(false);
        });
        currentBtn.setVisible(true);
    },

    /**
     *
     */
    transformCoords: function(coordToTransform, mapProjection, targetCrs) {
        var transformedCoords = ol.proj.transform(coordToTransform,
            mapProjection, targetCrs);

        if (targetCrs.getUnits() === "m") {
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
     *
     */
    transform: function(evtOrBtnOrArray) {
        var me = Ext.ComponentQuery.query(
            'basigx-form-coordinatetransform')[0],
            map = Ext.ComponentQuery.query('basigx-component-map')[0].getMap(),
            mapProjection = map.getView().getProjection(),
            fieldSets = me.query('fieldset'),
            transformvectorlayer = BasiGX.util.Layer.getLayerByName(
                'transformvectorlayer'),
            isOlEvt = evtOrBtnOrArray instanceof ol.MapBrowserPointerEvent,
            isCoordArray = Ext.isArray(evtOrBtnOrArray) &&
                evtOrBtnOrArray.length === 2,
            coords = [],
            coordsSrs = mapProjection,
            transformedCoords;

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
                    transformedCoords = me.transformCoords(
                        coords, coordsSrs, ol.proj.get(fs.crs));
                } else {
                    transformedCoords = me.transformCoords(
                        coords, mapProjection, ol.proj.get(fs.crs));
                }

                fs.down('numberfield[name=xcoord]').setValue(transformedCoords[0]);
                fs.down('numberfield[name=ycoord]').setValue(transformedCoords[1]);
            }
        });

        // now show coord on map
        if (!Ext.isDefined(transformvectorlayer)) {
            transformvectorlayer = new ol.layer.Vector({
                name: 'transformvectorlayer',
                source: new ol.source.Vector(),
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 0, 0, 0.7)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255, 0, 0, 0.7)'
                        })
                    })
                })
            });

            map.addLayer(transformvectorlayer);
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
            map.getView().setCenter(transformedMapCoords);
        }
    }
});
