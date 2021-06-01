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
 * A geolocation tool button.
 *
 * @class BasiGX.view.button.Geolocation
 */
Ext.define('BasiGX.view.button.Geolocation', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-geolocation',

    requires: [
        'BasiGX.util.Layer',
        'BasiGX.util.Map',
        'Ext.app.ViewModel'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            text: 'GPS Position anzeigen',
            tooltip: 'GPS Position anzeigen',
            documentation: '<h2>GPS Position anzeigen</h2>• Ein Klick auf den Button ' +
                'aktiviert die Geo Lokalisierung.<br>• Auf der Karte wird die ' +
                'Position angezeigt.'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf041@FontAwesome',
    html: '<i class="fa fa-map-marker fa-2x"></i>',

    /**
     * A config object to show this tool in action (live demo) when using the
     * context sensitive help
     */
    liveDemoConfig: [
        {
            moveMouseTo: {
                component: 'basigx-button-geolocation',
                moveDuration: 2000
            }
        },
        {
            clickOnButton: 'basigx-button-geolocation'
        },
        {
            moveMouseTo: {
                component: 'basigx-button-geolocation',
                moveDuration: 2000
            }
        },
        {
            clickOnButton: 'basigx-button-geolocation'
        }
    ],

    /**
     *
     */
    enableToggle: true,

    /**
     *
     */
    geolocationVectorLayer: null,

    /**
     *
     */
    geolocation: null,

    /**
     *
     */
    showAccuracy: true,

    /**
     *
     */
    strokeColor: 'rgba(255, 0, 0, 0.8)',

    /**
     *
     */
    fillColor: 'rgba(255, 0, 0, 0.5)',

    /**
     *
     */
    positionFeature: null,

    /**
     *
     */
    accuracyFeature: null,

    /**
     *
     */
    constructor: function () {
        var me = this;
        var LayerUtil = BasiGX.util.Layer;

        me.callParent(arguments);

        me.map = BasiGX.util.Map.getMapComponent().getMap();

        var nameGeolocationLayer = LayerUtil.NAME_GEOLOCATION_LAYER;
        var geolocationLayer = LayerUtil.getLayerByName(nameGeolocationLayer);

        if (Ext.isEmpty(geolocationLayer)) {
            geolocationLayer = me.createGeolocationLayer();
            geolocationLayer.set('bp_displayInLayerSwitcher', false);
            me.map.addLayer(geolocationLayer);
        }

        me.geolocationVectorLayer = geolocationLayer;

        me.geolocation = new ol.Geolocation({
            projection: me.map.getView().getProjection()
        });
        me.geolocation.on('change:position', function () {
            me.updatePositionFeature(me.geolocation.getPosition());
        });
        me.geolocation.on('change:accuracyGeometry', function () {
            if (me.showAccuracy) {
                me.updateAccuracyFeature(me.geolocation.getAccuracyGeometry());
            }
        });

        me.on('toggle', me.onBtnToggle, me);
    },

    updatePositionFeature: function (coords) {
        var me = this;
        if (coords) {
            if (!me.positionFeature) {
                me.positionFeature = new ol.Feature();
                me.geolocationVectorLayer.getSource().addFeature(me.positionFeature);
            }
            me.positionFeature.setGeometry(new ol.geom.Point(coords))
        } else {
            if (me.positionFeature) {
                me.geolocationVectorLayer.getSource().removeFeature(me.positionFeature);
                me.positionFeature = null;
            }
        }
    },

    updateAccuracyFeature: function (geom) {
        var me = this;
        if (geom) {
            if (!me.accuracyFeature) {
                me.accuracyFeature = new ol.Feature();
                me.geolocationVectorLayer.getSource().addFeature(me.accuracyFeature);
            }
            me.accuracyFeature.setGeometry(geom)
        } else {
            if (me.accuracyFeature) {
                me.geolocationVectorLayer.getSource().removeFeature(me.accuracyFeature);
                me.accuracyFeature = null;
            }
        }
    },

    /**
     * Called when the button is toggled, this method ensures that everything
     * is cleaned up when unpressed, and that measuring can start when pressed.
     *
     * @param {Ext.Button} btn The measure button itself.
     * @param {Boolean} pressed Whether the button is now pressed or not.
     */
    onBtnToggle: function (btn, pressed) {
        var me = this;
        me.geolocation.setTracking(pressed);
        if (!pressed) {
            me.updateAccuracyFeature(null);
            me.updatePositionFeature(null);
        }
    },

    /**
     * Creates a correctly setup vector layer on which the draw interaction will
     * work.
     *
     * @return {ol.layer.Vector} The layer on which the draw interaction will
     *     work.
     */
    createGeolocationLayer: function () {
        var me = this;
        var LayerUtil = BasiGX.util.Layer;
        var nameGeolocationLayer = LayerUtil.NAME_GEOLOCATION_LAYER;
        var noLayerSwitcherKey = LayerUtil.KEY_DISPLAY_IN_LAYERSWITCHER;

        var geolocationLayer = new ol.layer.Vector({
            name: nameGeolocationLayer,
            source: new ol.source.Vector({
                features: new ol.Collection()
            }),
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: me.fillColor
                }),
                stroke: new ol.style.Stroke({
                    color: me.strokeColor,
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: me.fillColor
                    })
                })
            })
        });
        // Set our internal flag to filter this layer out of the tree / legend
        geolocationLayer.set(noLayerSwitcherKey, false);

        return geolocationLayer;
    }
});
