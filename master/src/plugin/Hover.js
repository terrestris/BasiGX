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
Ext.define('BasiGX.plugin.Hover', {
    extend: 'Ext.plugin.Abstract',

    alias: 'plugin.hover',
    pluginId: 'hover',

    inheritableStatics: {
        HOVER_OVERLAY_IDENTIFIER_KEY: 'name',
        HOVER_OVERLAY_IDENTIFIER_VALUE: 'featureinfooverlay'
    },

    config: {
        pointerRest: true,
        pointerRestInterval: 300,
        pointerRestPixelTolerance: 5,
        featureInfoEpsg: 'EPSG:3857',
        hoverVectorLayerSource: null,
        hoverVectorLayer: null,
        hoverVectorLayerInteraction: null
    },

    currentHoverTarget: null,

    pendingRequest: null,

    init: function (cmp) {
        var me = this;

        me.addHoverVectorLayerSource();
        me.addHoverVectorLayer();
        me.addHoverVectorLayerInteraction();

        me.setupMapEventListeners();
        this.setCmp(cmp);

        cmp.setPointerRest(this.getPointerRest());
        cmp.setPointerRestInterval(this.getPointerRestInterval());
        cmp.setPointerRestPixelTolerance(this.getPointerRestPixelTolerance());

        cmp.on('pointerrest', me.onPointerRest, me);
        cmp.on('pointerrestout', me.cleanupHoverArtifacts, me);
    },

    /**
     * Adds any relevant listeners on the ol.Map. For now we only ensure that
     * when the top-level layerGroup changes (e.g. by adding or removing a
     * layer), we cleanup any visual artifacts from hovering.
     *
     * @private
     */
    setupMapEventListeners: function(){
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        // whenever the layergroup changes, we need to cleanup hover artifacts
        map.on('change:layerGroup', me.cleanupHoverArtifacts, me);
    },

    /**
    *
    */
   addHoverVectorLayerInteraction: function() {
       var me = this;
       var mapComponent = me.getCmp();
       var map = mapComponent.getMap();

       if (!me.getHoverVectorLayerInteraction()) {
            var interaction = new ol.interaction.Select({
                multi: true,
                style: me.selectStyleFunction,
                layers : [ me.getHoverVectorLayer() ]
            });
            var featureCollecion = interaction.getFeatures();

            featureCollecion.on('add', this.onFeatureClicked, this);
            map.addInteraction(interaction);
            me.setHoverVectorLayerInteraction(interaction);
        }
   },

   /**
    *
    */
   onFeatureClicked: function(olEvt) {
       var me = this;
       var mapComponent = me.getCmp();
       var olFeatures = olEvt.target.getArray();
       mapComponent.fireEvent('hoverfeaturesclick', olFeatures);
   },

   /**
    *
    */
   addHoverVectorLayerSource: function() {
       var me = this;
       if (!me.getHoverVectorLayerSource()) {
           me.setHoverVectorLayerSource(new ol.source.Vector());
       }
   },

   /**
    *
    */
   addHoverVectorLayer: function() {
       var me = this;
       var mapComponent = me.getCmp();
       var map = mapComponent.getMap();

       var hoverVectorLayer = me.getHoverVectorLayer();

       if (!hoverVectorLayer) {
           hoverVectorLayer = new ol.layer.Vector({
               name: 'hoverVectorLayer',
               source: me.getHoverVectorLayerSource(),
               visible: true
           });
           map.addLayer(hoverVectorLayer);
           me.setHoverVectorLayer(hoverVectorLayer);
       }
       // Set our internal flag to filter this layer out of the tree / legend
       var displayInLayerSwitcherKey = BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
       hoverVectorLayer.set(displayInLayerSwitcherKey, false);
   },

   /**
    *
    */
   clearPendingRequests: function() {
       var me = this;
       if(me.pendingRequest) {
           Ext.Ajax.abort(me.pendingRequest);
       }
   },

   /**
    *
    */
   requestAsynchronously: function(url, cb) {
       var me = this;

       me.pendingRequest = Ext.Ajax.request({
           url: url,
           callback: function(){
               me.pendingRequest = null;
           },
           success: cb,
           failure: function(resp) {
               Ext.log.error('Couldn\'t get FeatureInfo', resp);
           }
       });
   },

   cleanupHoverArtifacts: function(){
       var me = this;
       var overlayIdentifierKey = me.self.HOVER_OVERLAY_IDENTIFIER_KEY;
       var overlayIdentifierVal = me.self.HOVER_OVERLAY_IDENTIFIER_VALUE;
       var mapComponent = me.getCmp();
       var map = mapComponent.getMap();

       me.clearPendingRequests();
       me.getHoverVectorLayerSource().clear();
       map.getOverlays().forEach(function(o) {
           if (o.get(overlayIdentifierKey) === overlayIdentifierVal) {
               map.removeOverlay(o);
           }
       });
   },

   /**
    */
   onPointerRest: function(evt){
       var me = this;
       var mapComponent = me.getCmp();
       var map = mapComponent.getMap();
       var mapView = map.getView();
       var pixel = evt.pixel;
       var hoverLayers = [];
       var hoverFeatures = [];

       me.cleanupHoverArtifacts();

       map.forEachLayerAtPixel(pixel, function(layer) {
           var source = layer.getSource();
           var resolution = mapView.getResolution();
           var projCode = mapView.getProjection().getCode();
           var hoverable = layer.get('hoverable');

           // a layer will NOT be requested for hovering if there is a
           // "hoverable" property set to false. If this property is not set
           // or has any other value than "false", the layer will be
           // requested
           if(hoverable !== false) {
               if (source instanceof ol.source.TileWMS) {
//                   me.cleanupHoverArtifacts();
                   var url = source.getGetFeatureInfoUrl(
                           evt.coordinate,
                           resolution,
                           projCode,
                           {'INFO_FORMAT': 'application/json'}
                   );
                   var urlWithParams = url + '&FEATURE_COUNT=50';

                   me.requestAsynchronously(urlWithParams, function(resp) {
                       // TODO: replace evt/coords with real response geometry
                       var respFeatures = (new ol.format.GeoJSON())
                           .readFeatures(resp.responseText);
                       var respProjection = (new ol.format.GeoJSON())
                           .readProjection(resp.responseText);
                       me.showHoverFeature(layer, respFeatures, respProjection);

                       Ext.each(respFeatures, function(feature){
                           feature.set('layer', layer);
                           hoverFeatures.push(feature);
                       });
                       hoverLayers.push(layer);

                       me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
                   });
               } else if (source instanceof ol.source.Vector) {
                   // VECTOR!
                   map.forEachFeatureAtPixel(pixel, function(feat){
                       if(layer.get('type') === "WFS" ||
                          layer.get('type') === "WFSCluster"){
                           var hvl = me.getHoverVectorLayer();
                           // TODO This should be dynamically generated
                           // from the clusterStyle
                           hvl.setStyle(me.highlightStyleFunction);
                       }
                       var featureClone = feat.clone();
                       featureClone.set('layer', layer);
                       hoverLayers.push(layer);
                       hoverFeatures.push(featureClone);
                       me.showHoverFeature(layer, hoverFeatures);
                       me.currentHoverTarget = feat;

                   }, me, function(vectorCand){
                       return vectorCand === layer;
                   });
               }
           }

       }, this, me.hoverLayerFilter);

       me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
   },

   /**
    *
    */
   hoverLayerFilter: function(candidate) {
       if(candidate.get('hoverable') ||
           candidate.get('type') === 'WFSCluster'){
           return true;
       } else {
           return false;
      }
   },

   /**
    *
    */
   showHoverFeature: function(layer, features, projection) {
       var me = this;
       var mapComponent = me.getCmp();
       var map = mapComponent.getMap();
       var proj = me.getFeatureInfoEpsg();
       if(projection){
           proj = projection;
       }

       Ext.each(features, function(feat){
           var g = feat.getGeometry();
           if(g){
               g.transform(proj, map.getView().getProjection());
           }
           if(!Ext.Array.contains(me.getHoverVectorLayerSource().getFeatures(),
               feat)){
               me.getHoverVectorLayerSource().addFeature(feat);
           }
       });
   },

   /**
    *
    */
   showHoverToolTip: function(evt, layers, features) {
       var me = this;
       var overlayIdentifierKey = me.self.HOVER_OVERLAY_IDENTIFIER_KEY;
       var overlayIdentifierVal = me.self.HOVER_OVERLAY_IDENTIFIER_VALUE;
       var mapComponent = me.getCmp();
       var map = mapComponent.getMap();
       var coords = evt.coordinate;

       if(layers.length > 0 && features.length > 0){
           map.getOverlays().forEach(function(o) {
               map.removeOverlay(o);
           });

           var div = Ext.dom.Helper.createDom('<div>');
           div.className = 'feature-hover-popup';
           div.innerHTML = this.getToolTipHtml(layers, features);
           var overlay = new ol.Overlay({
               position: coords,
               offset: [10, -30],
               element: div
           });
           overlay.set(overlayIdentifierKey, overlayIdentifierVal);
           map.addOverlay(overlay);
       }

   },

   /**
    *
    */
   getToolTipHtml: function(layers, features){
       var innerHtml = '';

       Ext.each(features, function(feat){
           var layer = feat.get('layer');
           var hoverfield = layer.get('hoverfield');

           // fallback if hoverfield is not configured
           if(!hoverfield) {
               // try to use "id" as fallback.
               // if "id" is not available, the value will be "undefined"
               hoverfield = 'id';
           }
           innerHtml += '<b>' + layer.get('name') + '</b>';

           // we check for existing feature here as there maybe strange
           // situations (e.g. when zooming in unfavorable situations)
           // where feat is undefined
           if(feat) {
               if(layer.get('type') === 'WFSCluster'){
                   var count = feat.get('count');
                   innerHtml += '<br />' + count + '<br />';
               } else {
                   var hoverfieldValue = feat.get(hoverfield);
                   innerHtml += '<br />' + hoverfieldValue + '<br />';
               }
           }
       });

       return innerHtml;
   },

   highlightStyleFunction: function(feature){
       var count = feature.get('count'),
       radius = 14,
       fontSize = 10;

       if (count && count > 10) {
           radius = 25;
           fontSize = 14;
       } else if (count && count < 4) {
           fontSize = 7;
           radius = 8;
       } else if (count) {
           radius = count * 2;
           fontSize = count * 1.3;
       }

       return [
           new ol.style.Style({
               fill: new ol.style.Fill({
                   color: "rgba(255, 0, 0, 0.6)"
               }),
               image: new ol.style.Circle({
                   radius: radius,
                   fill: new ol.style.Fill({
                       color: "rgba(255, 0, 0, 0.6)"
                   }),
                   stroke: new ol.style.Stroke({
                       color: 'gray'
                   })
               }),
               text: new ol.style.Text({
                   text: count > 1 ? count.toString() : '',
                   font: 'bold ' + fontSize * 2 + 'px Arial',
                   stroke: new ol.style.Stroke({
                       color: 'black',
                       width: 1
                   }),
                   fill: new ol.style.Fill({color: 'white'})
               })
           })
       ];
   },

   selectStyleFunction: function(feature){
       var count = feature.get('count'),
       radius = 14,
       fontSize = 10;

       if (count && count > 10) {
           radius = 25;
           fontSize = 14;
       } else if (count && count < 4) {
           fontSize = 7;
           radius = 8;
       } else if (count) {
           radius = count * 2;
           fontSize = count * 1.3;
       }
       return [
           new ol.style.Style({
               fill: new ol.style.Fill({
                   color: "rgba(0, 0, 255, 0.6)"
               }),
               image: new ol.style.Circle({
                   radius: radius,
                   fill: new ol.style.Fill({
                       color: "rgba(0, 0, 255, 0.6)"
                   }),
                   stroke: new ol.style.Stroke({
                       color: 'gray'
                   })
               }),
               text: new ol.style.Text({
                   text: count > 1 ? count.toString() : '',
                   font: 'bold ' + fontSize * 2 + 'px Arial',
                   stroke: new ol.style.Stroke({
                       color: 'black',
                       width: 1
                   }),
                   fill: new ol.style.Fill({color: 'white'})
               })
           })
       ];
   },

   hoverClusterFeatures: function(pixel){
       var me = this;
       var mapComponent = me.getCmp();
       var map = mapComponent.getMap();
       var wmsHoverPlugin = mapComponent.getPlugin('wmshover');

       var feature = map.forEachFeatureAtPixel(pixel, function(feat) {
           return feat;
       });

       if(feature === me.highlightFeature || !feature){
           wmsHoverPlugin.cleanupHoverArtifacts();
           return;
       } else {
           var hvl = wmsHoverPlugin.getHoverVectorLayer();
           hvl.setStyle(me.highlightStyleFunction);
           var hvlSource = wmsHoverPlugin.getHoverVectorLayerSource();
           wmsHoverPlugin.cleanupHoverArtifacts();
           hvlSource.addFeature(feature);
           me.highLightedFeature = feature;
       }
   }

});
