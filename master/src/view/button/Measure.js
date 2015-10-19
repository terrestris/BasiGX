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
 * Measure Tool Button
 *
 * Mainly ripped from ol3 examples
 *
 */
Ext.define("BasiGX.view.button.Measure", {
    extend: "Ext.button.Button",
    xtype: 'basigx-button-measure',

    requires: [
        "BasiGX.util.Layer"
    ],

   /**
    *
    */
    viewModel: {
       data: {
           textline: 'Strecke messen',
           textpoly: 'Fläche messen'
       }
    },

    /**
     *
     */
    measureVectorLayer: null,

    /**
     *
     */
    drawAction: null,

    /**
     *
     */
    geodesic: true,

    /**
     *
     */
    measureType: 'line',

    /**
     * Currently drawn feature.
     * @type {ol.Feature}
     */
    sketch: null,

    /**
     * The help tooltip element.
     * @type {Element}
     */
    helpTooltipElement: null,


    /**
     * Overlay to show the help messages.
     * @type {ol.Overlay}
     */
    helpTooltip: null,

    /**
     * The measure tooltip element.
     * @type {Element}
     */
    measureTooltipElement: null,

    /**
     * Overlay to show the measurement.
     * @type {ol.Overlay}
     */
    measureTooltip: null,


    /**
     * Message to show when the user is drawing a polygon.
     * @type {string}
     */
    continuePolygonMsg: 'Klicken zum Zeichnen der Fläche',


    /**
     * Message to show when the user is drawing a line.
     * @type {string}
     */
    continueLineMsg: 'Klicken zum Zeichnen der Strecke',

    /**
     *
     */
    clickToDrawText: 'Klicken zum Messen',

    /**
     * used to allow / disallow multiple drawings at a time on the map
     */
    allowOnlyOneDrawing: true,

    /**
     *
     */
    strokeColor: 'rgba(255, 0, 0, 0.8)',

    /**
     *
     */
    fillColor: 'rgba(255, 0, 0, 0.5)',

    /**
     * how many decimal places will be allowed for the measure tooltips
     */
    decimalPlacesInToolTips: 2,

    /**
     * determine if a area / line greater than 10000
     * should be switched to km instead of m in popups
     */
    switchToKmOnLargeValues: true,

    /**
     * determines if a marker with current measurement should be shown every
     * time the user clicks while drawing
     */
    showMeasureInfoOnClickedPoints: false,

    /**
     *
     */
    initComponent: function() {

        var me = this,
            source = new ol.source.Vector({
                features: new ol.Collection()
            }),
            measureLayer;

        me.map = Ext.ComponentQuery.query('gx_map')[0].getMap();

//        var btnText = (me.measureType === 'line' ? '{textline}' : '{textpoly}');
//        me.setBind({
//            text: btnText
//        });

        measureLayer = BasiGX.util.Layer.getLayerByName('measurelayer');

        if (Ext.isEmpty(measureLayer)) {
            me.measureVectorLayer = new ol.layer.Vector({
                name: 'measurelayer',
                source: source,
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
            me.map.addLayer(me.measureVectorLayer);
        } else {
            me.measureVectorLayer = measureLayer;
        }
        // Set our internal flag to filter this layer out of the tree / legend
        var noLayerSwitcherKey = BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
        me.measureVectorLayer.set(noLayerSwitcherKey, false);

        var type = (me.measureType === 'line' ? 'MultiLineString' : 'MultiPolygon');
        me.drawAction = new ol.interaction.Draw({
            name: 'drawaction',
            source: source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: me.fillColor
                }),
                stroke: new ol.style.Stroke({
                    color: me.strokeColor,
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: me.strokeColor
                    }),
                    fill: new ol.style.Fill({
                        color: me.fillColor
                    })
                })
            })
        });
        me.drawAction.setActive(false);
        me.map.addInteraction(me.drawAction);
    },

   /**
    *
    */
    handler: function(){
        var me = this;

        me.on('toggle', function(btn, pressed) {
            if (pressed) {
                me.drawAction.setActive(true);
                me.createMeasureTooltip();
                me.createHelpTooltip();

                me.drawAction.on('drawstart', me.drawStart, me);
                me.drawAction.on('drawend', me.drawEnd, me);
                me.map.on('pointermove', me.pointerMoveHandler, me);
            } else {
                // we need to cleanup and return
                me.cleanUp(me);
            }
        });
        me.toggle();
    },

    /**
     *
     */
    cleanUp: function(me) {
        me.drawAction.setActive(false);
        me.drawAction.un('drawstart', me.drawStart, me);
        me.drawAction.un('drawend', me.drawEnd, me);
        me.map.un('pointermove', me.pointerMoveHandler, me);
        me.map.un('click', me.addMeasureStopToolTip, me);

        me.cleanUpToolTips();

        me.measureVectorLayer.getSource().clear();
    },

    /**
     *
     */
    cleanUpToolTips: function() {
        var me = this;
        me.helpTooltipElement = null;
        me.measureTooltipElement = null;
        Ext.each(Ext.DomQuery.select('.tooltip-static'), function(el) {
            el.parentNode.removeChild(el);
        });

        Ext.each(me.map.getOverlays().getArray(), function(overlay) {
            if (overlay === me.measureTooltip ||
                overlay === me.helpTooltip) {
                    me.map.removeOverlay(overlay);
            }
        });
    },
    addMeasureStopToolTip: function(evt) {
        var me = this;
        if (!Ext.isEmpty(me.sketch)) {
            var geom = me.sketch.getGeometry(),
                value = me.measureType === 'line' ? me.formatLength(geom) :
                    me.formatArea(geom);
            if (parseInt(value, 10) > 0) {
                var div = Ext.dom.Helper.createDom('<div>');
                div.className = 'tooltip tooltip-static';
                div.innerHTML = value;
                var tooltip = new ol.Overlay({
                    element: div,
                    offset: [0, -15],
                    positioning: 'bottom-center'
                });
                me.map.addOverlay(tooltip);
                tooltip.setPosition(evt.coordinate);
            }
        }
    },

    /**
     *
     */
    drawStart: function(evt) {
        var me = this;
        var source = me.measureVectorLayer.getSource();
        me.sketch = evt.feature;

        if (me.showMeasureInfoOnClickedPoints &&
            me.measureType === 'line') {
                me.map.on('click', me.addMeasureStopToolTip, me);
        }

        if (me.allowOnlyOneDrawing && source.getFeatures().length > 0) {
            me.cleanUpToolTips();
            me.createMeasureTooltip();
            me.createHelpTooltip();
            me.measureVectorLayer.getSource().clear();
        }
    },

    /**
     *
     */
    drawEnd: function(evt) {
        var me = this;

        me.map.un('click', me.addMeasureStopToolTip, me);

        // seems we need to add the feature manually in polygon measure mode
        // maybe an ol3 bug?
        if (me.measureType === 'polygon') {
            me.measureVectorLayer.getSource().addFeatures([evt.feature]);
        }

        if (me.showMeasureInfoOnClickedPoints &&
            me.measureType === 'line') {
                me.measureTooltip = null;
                if (me.measureTooltipElement) {
                    me.measureTooltipElement.parentNode.removeChild(
                        me.measureTooltipElement);
                }
        } else {
            me.measureTooltipElement.className = 'tooltip tooltip-static';
            me.measureTooltip.setOffset([0, -7]);
        }

        // unset sketch
        me.sketch = null;
        // unset tooltip so that a new one can be created
        me.measureTooltipElement = null;
        me.createMeasureTooltip();
    },

   /**
    * Handle pointer move.
    * @param {ol.MapBrowserEvent} evt
    */
   pointerMoveHandler: function(evt) {
       var me = this;

       if (evt.dragging) {
           return;
       }
       var helpMsg = me.clickToDrawText;
       var helpTooltipCoord = evt.coordinate;
       var measureTooltipCoord = evt.coordinate;

       if (me.sketch) {
           var output;
           var geom = (me.sketch.getGeometry());
           if (geom instanceof ol.geom.Polygon) {
               output = me.formatArea(geom);
               helpMsg = me.continuePolygonMsg;
               helpTooltipCoord = geom.getLastCoordinate();
               measureTooltipCoord = geom.getInteriorPoint().getCoordinates();
           } else if (geom instanceof ol.geom.LineString) {
               output = me.formatLength(geom);
               helpMsg = me.continueLineMsg;
               helpTooltipCoord = geom.getLastCoordinate();
               measureTooltipCoord = geom.getLastCoordinate();
           }
           me.measureTooltipElement.innerHTML = output;
           me.measureTooltip.setPosition(measureTooltipCoord);
       }

       me.helpTooltipElement.innerHTML = helpMsg;
       me.helpTooltip.setPosition(helpTooltipCoord);
   },

   /**
    * Creates a new help tooltip
    */
   createHelpTooltip: function() {
       var me = this;

       if (me.helpTooltipElement) {
           me.helpTooltipElement.parentNode.removeChild(me.helpTooltipElement);
       }
       me.helpTooltipElement = Ext.dom.Helper.createDom('<div>');
       me.helpTooltipElement.className = 'tooltip';
       me.helpTooltip = new ol.Overlay({
           element: me.helpTooltipElement,
           offset: [15, 0],
           positioning: 'center-left'
       });
       me.map.addOverlay(me.helpTooltip);
    },


   /**
    * Creates a new measure tooltip
    */
   createMeasureTooltip: function() {
       var me = this;
       if (me.measureTooltipElement) {
           me.measureTooltipElement.parentNode.removeChild(
               me.measureTooltipElement);
       }
       me.measureTooltipElement = Ext.dom.Helper.createDom('<div>');
       me.measureTooltipElement.className = 'tooltip tooltip-measure';
       me.measureTooltip = new ol.Overlay({
           element: me.measureTooltipElement,
           offset: [0, -15],
           positioning: 'bottom-center'
       });
       me.map.addOverlay(me.measureTooltip);
   },

   /**
    * format length output
    * @param {ol.geom.LineString} line
    * @return {string}
    */
    formatLength: function(line) {
        var me = this,
            decimalHelper = Math.pow(10, me.decimalPlacesInToolTips),
            length;
        if (me.geodesic) {
            var wgs84Sphere = new ol.Sphere(6378137);
            var coordinates = line.getCoordinates();
            length = 0;
            var sourceProj = me.map.getView().getProjection();
            for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
                var c1 = ol.proj.transform(
                    coordinates[i], sourceProj, 'EPSG:4326');
                var c2 = ol.proj.transform(
                    coordinates[i + 1], sourceProj, 'EPSG:4326');
                length += wgs84Sphere.haversineDistance(c1, c2);
            }
        } else {
            length = Math.round(line.getLength() * 100) / 100;
        }
        var output;
        if (me.switchToKmOnLargeValues && length > 1000) {
           output = (Math.round(length / 1000 * decimalHelper) /
               decimalHelper) + ' ' + 'km';
        } else {
            output = (Math.round(length * decimalHelper) / decimalHelper) +
                ' m';
        }
        return output;
   },


   /**
    * format length output
    * @param {ol.geom.Polygon} polygon
    * @return {string}
    */
   formatArea: function(polygon) {
       var me = this,
           decimalHelper = Math.pow(10, me.decimalPlacesInToolTips),
           area;
       if (me.geodesic) {
           var wgs84Sphere = new ol.Sphere(6378137);
           var sourceProj = me.map.getView().getProjection();
           var geom = (polygon.clone().transform(
               sourceProj, 'EPSG:4326'));
           var coordinates = geom.getLinearRing(0).getCoordinates();
           area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
       } else {
           area = polygon.getArea();
       }

       var output;
       if (me.switchToKmOnLargeValues && area > 10000) {
           output = (Math.round(area / 1000000 * decimalHelper) /
                   decimalHelper) + ' km<sup>2</sup>';
       } else {
           output = (Math.round(area * decimalHelper) / decimalHelper) +
               ' ' + 'm<sup>2</sup>';
       }
       return output;
   }
});
