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
 * @class BasiGX.util.Animate
 */
Ext.define('BasiGX.util.Animate', {
    requires: [
        'BasiGX.util.Map'
    ],
    statics: {
       shake: function(component, duration, amplitude){
           duration = duration || 200;
           amplitude = amplitude || 5;
           var startX = component.getX();
           component.animate({
               duration: duration,
               keyframes: {
                   0: {
                       x: startX + amplitude
                   },
                   25: {
                       x: startX - amplitude
                   },
                   50: {
                       x: startX + amplitude
                   },
                   75: {
                       x: startX - amplitude
                   },
                   100: {
                       x: startX
                   }
               }
           });
       },

       flashFeature: function(feature, duration) {
           var map = BasiGX.util.Map.getMapComponent().getMap();
           var start = new Date().getTime();
           var listenerKey;

           function animate(event) {
             var vectorContext = event.vectorContext;
             var frameState = event.frameState;
             var flashGeom = feature.getGeometry().clone();
             var elapsed = frameState.time - start;
             var elapsedRatio = elapsed / duration;
             // radius will be 5 at start and 30 at end.
             var radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
             var opacity = ol.easing.easeOut(1 - elapsedRatio);
             var flashStyle;

             if (vectorContext.setStyle && vectorContext.drawGeometry) {
                 // for ol3 versions from v3.15.0
                 flashStyle = new ol.style.Style({
                     image: new ol.style.Circle({
                         radius: radius,
                         snapToPixel: false,
                         stroke: new ol.style.Stroke({
                             color: 'rgba(255, 0, 0, ' + opacity + ')',
                             width: 4,
                             opacity: opacity
                         })
                     })
                 });
                 vectorContext.setStyle(flashStyle);
                 vectorContext.drawGeometry(flashGeom, null);
             } else {
                 // for ol3 versions older v3.15.0
                 flashStyle = new ol.style.Circle({
                     radius: radius,
                     snapToPixel: false,
                     stroke: new ol.style.Stroke({
                         color: 'rgba(255, 0, 0, ' + opacity + ')',
                         width: 4,
                         opacity: opacity
                     })
                 });
                 vectorContext.setImageStyle(flashStyle);
                 vectorContext.drawPointGeometry(flashGeom, null);
             }

             if (elapsed > duration) {
               ol.Observable.unByKey(listenerKey);
               return;
             }
             // tell OL3 to continue postcompose animation
             frameState.animate = true;
           }
           listenerKey = map.on('postcompose', animate);
           return listenerKey;
       },

       /**
        * Moves / translates a Feature to the given pixel delta in
        * the given duration in ms, using the given style, calling a doneFn
        * in the end
        *
        * Useful e.g. when hovering clustered features to show their children
        */
       moveFeature: function(featureToMove, duration, pixel, style, doneFn) {
           var map = BasiGX.util.Map.getMapComponent().getMap();
           var listenerKey;

           var geometry = featureToMove.getGeometry();
           var start = new Date().getTime();
           var resolution = map.getView().getResolution();

           if (typeof style === 'function') {
               style = style(featureToMove, resolution);
           }

           var totalDisplacement = pixel * resolution;
           var expectedFrames = duration / 1000 * 60;
           var actualFrames = 0;
           var deltaX = totalDisplacement / expectedFrames;
           var deltaY = totalDisplacement / expectedFrames;

           var animate = function(event) {
               var vectorContext = event.vectorContext;
               var frameState = event.frameState;
               var elapsed = frameState.time - start;

               geometry.translate(deltaX, deltaY);

               if (vectorContext.setFillStrokeStyle &&
                   vectorContext.setImageStyle &&
                   vectorContext.drawPointGeometry) {
                       vectorContext.setFillStrokeStyle(
                               style.getFill(), style.getStroke());
                       vectorContext.setImageStyle(style.getImage());
                       if (geometry instanceof ol.geom.Point) {
                           vectorContext.drawPointGeometry(geometry, null);
                       } else if (geometry instanceof ol.geom.LineString) {
                           vectorContext.drawLineStringGeometry(geometry, null);
                       } else {
                           vectorContext.drawPolygonGeometry(geometry, null);
                       }
               } else {
                   vectorContext.setStyle(style);
                   vectorContext.drawGeometry(geometry);
               }

               if (elapsed > duration || actualFrames >= expectedFrames) {
                   ol.Observable.unByKey(listenerKey);
                   doneFn(featureToMove);
                   return;
               }
               // tell OL3 to continue postcompose animation
               frameState.animate = true;

               actualFrames++;
           };

           listenerKey = map.on('postcompose', animate);
           return listenerKey;
       }
    }
});
