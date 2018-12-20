/* Copyright (c) 2016-present terrestris GmbH & Co. KG
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
 * Redlining Tools Container
 *
 * @class BasiGX.view.container.Redlining
 */
Ext.define('BasiGX.view.container.Redlining', {
    extend: 'Ext.container.Container',
    xtype: 'basigx-container-redlining',

    requires: [
        'BasiGX.view.button.DigitizePoint',
        'BasiGX.view.button.DigitizeLine',
        'BasiGX.view.button.DigitizePolygon',
        'BasiGX.view.button.DigitizeCopyObject',
        'BasiGX.view.button.DigitizeMoveObject',
        'BasiGX.view.button.DigitizeModifyObject',
        'BasiGX.view.button.DigitizeDeleteObject',
        'BasiGX.view.button.DigitizePostit',
        'BasiGX.view.button.DigitizeOpenStyler'
    ],

    layout: 'hbox',

    /**
     *
     */
    viewModel: {
        data: {
            documentation: '<h2>Redlining</h2>• Verwenden Sie das ' +
                'Redlining, um mit verschiedenen Werkzeugen auf der Karte ' +
                'zu zeichnen.<br>• Neben Punkten, Linien und Flächen können ' +
                'auch Notizzettel mit eigenem Text der Karte hinzugefügt ' +
                'werden'
        }
    },

    /**
     *
     */
    redliningVectorLayer: null,

    /**
     *
     */
    redlineFeatures: null,

    /**
     *
     */
    map: null,

    /**
     * Temporary member that will be set to true while setState is runnning.
     */
    stateChangeActive: false,

    /**
     *
     */
    config: {
        /**
         * The url objects for images.
         *
         * Can contain url and method property
         */
        backendUrls: {
            pictureList: null,
            pictureSrc: null,
            pictureUpload: null,
            graphicDelete: null
        },

        /**
         * The URL to a picture used for the postits.
         *
         * It is highly recommended that you set your own image source here
         */
        postitPictureUrl: null,

        /**
         * The maximum length of text allowed for the postit
         */
        postitTextMaxLength: 130,

        /**
         * A style to use for points.
         *
         * @type {ol.style.Style}
         */
        redlinePointStyle: new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: 'green'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                })
            })
        }),

        /**
         * A style to use for linestrings.
         *
         * @type {ol.style.Style}
         */
        redlineLineStringStyle: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            })
        }),

        /**
         * A style to use for polygons.
         *
         * @type {ol.style.Style}
         */
        redlinePolygonStyle: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'green'
            })
        }),

        /**
         * A function that can be used to style `ol.Features`. Will return a
         * either #redlinePointStyle, #redlineLineStringStyle or (for polygon
         * features) #redlinePolygonStyle, bvased on the geometry type of the
         * geometry of the passed `feature`.
         *
         * @param {ol.Feature} feature The feature to style.
         * @return {ol.style.Style} The appropriate style for the feature.
         */
        redlineStyleFunction: function(feature) {
            var redliningContainer = Ext.ComponentQuery.query(
                'basigx-container-redlining'
            )[0];

            if (!(feature instanceof ol.Feature)) {
                return;
            }

            var geometry = feature.getGeometry();
            if (geometry instanceof ol.geom.Point) {
                return redliningContainer.getRedlinePointStyle();
            } else if (geometry instanceof ol.geom.LineString) {
                return redliningContainer.getRedlineLineStringStyle();
            } else {
                return redliningContainer.getRedlinePolygonStyle();
            }
        }
    },

    /**
     * @event redliningchanged
     * An event that fires everytime a feature is added, deleted, moved or
     * modified.
     * @param {BasiGX.view.container.Redlining} container
     *     The Redlining container.
     * @param {Object} state The current redlining state.
     * @param {Boolean} stateChangeActive While setState is runnning this will
     *     be true otherwise false.
     */

    /**
     *
     */
    initComponent: function() {
        var me = this;
        var displayInLayerSwitcherKey = BasiGX.util.Layer.
            KEY_DISPLAY_IN_LAYERSWITCHER;

        //set map
        me.map = BasiGX.util.Map.getMapComponent().getMap();

        if (!me.redliningVectorLayer) {
            me.redlineFeatures = new ol.Collection();
            me.redlineFeatures.on(
                'propertychange', me.fireRedliningChanged, me
            );
            me.redliningVectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({features: me.redlineFeatures}),
                style: me.getRedlineStyleFunction()
            });
            me.redliningVectorLayer.set(displayInLayerSwitcherKey, false);
            me.map.addLayer(me.redliningVectorLayer);
        }

        me.items = me.getRedlineItems();
        me.callParent(arguments);
    },

    listeners: {
        beforedestroy: function() {
            if (this.redlineFeatures) {
                this.redlineFeatures.un('propertychange',
                    this.fireRedliningChanged, this);
            }
        }
    },

    /**
     * Returns an array of ExtJS components (buttons etc.) to control redlining.
     *
     * @return {Array<Object>} The component configurations as array; ready to
     *     be used inside the `items` configuration of this container.
     */
    getRedlineItems: function() {
        var me = this;
        return [{
            xtype: 'basigx-button-digitize-point',
            collection: me.redlineFeatures,
            map: me.map
        }, {
            xtype: 'basigx-button-digitize-line',
            collection: me.redlineFeatures,
            map: me.map
        }, {
            xtype: 'basigx-button-digitize-polygon',
            collection: me.redlineFeatures,
            map: me.map
        }, {
            xtype: 'basigx-button-digitize-postit',
            collection: me.redlineFeatures,
            map: me.map,
            postitPictureUrl: me.getPostitPictureUrl(),
            postitTextMaxLength: me.getPostitTextMaxLength()
        }, {
            xtype: 'basigx-button-digitize-copy-object',
            collection: me.redlineFeatures,
            map: me.map,
            styleFn: me.redlineStyleFunction
        }, {
            xtype: 'basigx-button-digitize-move-object',
            collection: me.redlineFeatures,
            map: me.map,
            listeners: {
                'featurechanged': me.fireRedliningChanged
            }
        }, {
            xtype: 'basigx-button-digitize-modify-object',
            map: me.map,
            collection: me.redlineFeatures,
            listeners: {
                'featurechanged': me.fireRedliningChanged
            }
        }, {
            xtype: 'basigx-button-digitize-delete-object',
            map: me.map,
            collection: me.redlineFeatures
        }, {
            xtype: 'basigx-button-digitize-open-styler',
            redliningVectorLayer: me.redliningVectorLayer,
            backendUrls: me.getBackendUrls(),
            redlinePointStyle: me.getRedlinePointStyle(),
            redlinePolygonStyle: me.getRedlinePolygonStyle(),
            redlineLineStringStyle: me.getRedlineLineStringStyle(),
            listeners: {
                'featurechanged': me.fireRedliningChanged
            }
        }];
    },

    /**
     * This method returns the current state of the redlining, containing all
     * features and the configured styles.
     *
     * @return {Object} The current state of the redlining. The following keys
     *     represent the state: `features`, `pointStyle`, `lineStyle`,
     *     `polygonStyle` and `styleFunction`.
     */
    getState: function() {
        var me = this;
        var features = [];
        me.redlineFeatures.forEach(function(feature) {
            features.push(feature.clone());
        });

        var state = {
            features: features,
            pointStyle: me.getRedlinePointStyle(),
            lineStyle: me.getRedlineLineStringStyle(),
            polygonStyle: me.getRedlinePolygonStyle(),
            styleFunction: me.getRedlineStyleFunction()
        };

        return state;
    },

    /**
     * This method sets the state of the redlining, containing drawn features
     * and the configured styles.
     *
     * @param {Object} state An object with the new states of the redlining.
     *     Should have the following keys: `features`, `pointStyle`,
     *     `lineStyle`, `polygonStyle` and `styleFunction`.
     */
    setState: function(state) {
        var me = this;

        me.stateChangeActive = true;

        var styler = Ext.ComponentQuery.query(
            'basigx-container-redlinestyler')[0];

        if (state.features) {
            me.redliningVectorLayer.getSource().clear();
            me.redliningVectorLayer.getSource().addFeatures(state.features);
        }

        if (state.pointStyle) {
            me.setRedlinePointStyle(state.pointStyle);
        }

        if (state.lineStyle) {
            me.setRedlineLineStringStyle(state.lineStyle);
        }

        if (state.polygonStyle) {
            me.setRedlinePolygonStyle(state.polygonStyle);
        }

        if (styler) {
            styler.setState(state);
        }

        if (state.styleFunction) {
            me.setRedlineStyleFunction(state.styleFunction);
        }

        // reapply the styleFn on the layer so that ol starts redrawing
        // with new styles
        me.redliningVectorLayer.setStyle(me.redliningVectorLayer.getStyle());

        me.stateChangeActive = false;
    },

    fireRedliningChanged: function() {
        var myComp = Ext.ComponentQuery.query('basigx-container-redlining')[0];
        if (!myComp) {
            return;
        }
        myComp.fireEvent('redliningchanged', myComp, myComp.getState(),
            myComp.stateChangeActive);
        // enforce redraw, needed e.g. for label text changes to become visible
        myComp.redliningVectorLayer.changed();
    }
});
