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
           var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
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

             var flashStyle = new ol.style.Circle({
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
        * Moves / translates Features from origin geometry to destination in
        * the given duration in ms, using the given style, optionally fading out
        *
        * Useful e.g. when hovering clustered features to show their children
        */
       moveFeature: function(featureToMove, originFeature, duration, style, fadeOut) {
           var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
           var start = new Date().getTime();
           var listenerKey;
           var movingGeom = originFeature.getGeometry().clone();
           var targetGeom = featureToMove.getGeometry();

           function animate(event) {
               var vectorContext = event.vectorContext;
               var frameState = event.frameState;
               var elapsed = frameState.time - start;
               var deltaX = targetGeom.flatCoordinates[0] -
                   movingGeom.flatCoordinates[0];
               var deltaY = targetGeom.flatCoordinates[1] -
                   movingGeom.flatCoordinates[1];
               movingGeom.translate(deltaX / (duration/70), deltaY / (duration/70));

               var imageStyle = style.getImage();

               if (fadeOut) {
                   var factor = (duration - elapsed) / duration;
                   if (factor > 0) {
                       imageStyle.setOpacity(factor);
                   }
               }

               vectorContext.setImageStyle(imageStyle);
               vectorContext.drawPointGeometry(movingGeom, null);
               if (elapsed > duration) {
                   ol.Observable.unByKey(listenerKey);
                   return;
               }
               // tell OL3 to continue postcompose animation
               frameState.animate = true;
           }
           listenerKey = map.on('postcompose', animate);
           return listenerKey;
       }
    }
});
