/* Copyright (c) 2016 terrestris GmbH & Co. KG
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
Ext.define("BasiGX.view.container.Redlining", {
    extend: "Ext.container.Container",
    xtype: "basigx-container-redlining",

    requires: [
        'BasiGX.view.container.RedlineStyler'
    ],

    layout: 'hbox',

   /**
    *
    */
   drawPointInteraction: null,

   /**
    *
    */
   drawLineInteraction: null,

   /**
    *
    */
   drawPolygonInteraction: null,

   /**
    *
    */
   drawPostitInteraction: null,

   /**
    *
    */
   copySelectInteraction: null,

   /**
    *
    */
   translateInteraction: null,

   /**
    *
    */
   translateSelectInteraction: null,

   /**
    *
    */
   modifyInteraction: null,

   /**
    *
    */
   selectInteraction: null,

   /**
    *
    */
   deleteSelectInteraction: null,

   /**
    *
    */
   deleteModifyInteraction: null,

   /**
    *
    */
   deleteSnapInteraction: null,

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
   redliningToolsWin: null,

   /**
    *
    */
   config: {
       /**
        * The url objects for images.
        * Can contain url and method property
        */
       backendUrls: {
           pictureList: null,
           pictureSrc: null,
           pictureUpload: null,
           graphicDelete: null
       },

      /**
       *
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
       *
       */
      redlineLineStringStyle: new ol.style.Style({
          stroke: new ol.style.Stroke({
              color: '#ffcc33',
              width: 2
          })
      }),

      /**
       *
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
       *
       */
      redlineStyleFunction: function(feature) {
          var me = Ext.ComponentQuery.query('basigx-container-redlining')[0];

          if (!(feature instanceof ol.Feature)) {
              return;
          }

          var geometry = feature.getGeometry();
          if (geometry instanceof ol.geom.Point) {
              return me.getRedlinePointStyle();
          } else if (geometry instanceof ol.geom.LineString) {
              return me.getRedlineLineStringStyle();
          } else {
              return me.getRedlinePolygonStyle();
          }
      }
   },

   /**
    *
    */
   initComponent: function() {
       var me = this;
       var mapComponent = Ext.ComponentQuery.query('gx_component_map')[0];
       var map = mapComponent.getMap();
       var displayInLayerSwitcherKey = BasiGX.util.Layer.
           KEY_DISPLAY_IN_LAYERSWITCHER;

       if (!me.redliningVectorLayer) {
           me.redlineFeatures = new ol.Collection();
           me.redliningVectorLayer = new ol.layer.Vector({
               source: new ol.source.Vector({features: me.redlineFeatures}),
               style: me.getRedlineStyleFunction()
           });
           me.redliningVectorLayer.set(displayInLayerSwitcherKey, false);
           map.addLayer(me.redliningVectorLayer);
       }

       me.items = me.getRedlineItems();
       me.callParent(arguments);
   },

   /**
    *
    */
   getRedlineItems: function() {
       var me = this;
       var mapComponent = Ext.ComponentQuery.query('gx_component_map')[0];
       var map = mapComponent.getMap();

       return [
           {
               xtype: 'button',
               text: 'Draw Points',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawPointInteraction) {
                           me.drawPointInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'Point'
                           });
                           map.addInteraction(me.drawPointInteraction);
                       }
                       if (pressed) {
                           me.drawPointInteraction.setActive(true);
                       } else {
                           me.drawPointInteraction.setActive(false);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Draw Lines',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawLineInteraction) {
                           me.drawLineInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'LineString'
                           });
                           map.addInteraction(me.drawLineInteraction);
                       }
                       if (pressed) {
                           me.drawLineInteraction.setActive(true);
                       } else {
                           me.drawLineInteraction.setActive(false);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Draw Polygons',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawPolygonInteraction) {
                           me.drawPolygonInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'Polygon'
                           });
                           map.addInteraction(me.drawPolygonInteraction);
                       }
                       if (pressed) {
                           me.drawPolygonInteraction.setActive(true);
                       } else {
                           me.drawPolygonInteraction.setActive(false);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Draw Post-it',
               name: 'postitbutton',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawPostitInteraction) {
                           var classPath = Ext.Loader.getPath(
                               'BasiGX.view.container.Redlining');
                           var imageBaseSrc;
                           if (classPath) {
                               imageBaseSrc = classPath.split(
                                   'src/view/container/Redlining.js')[0];
                           }
                           me.drawPostitInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'Point',
                               style: new ol.style.Style({
                                   image: new ol.style.Icon({
                                       anchorXUnits: 'fraction',
                                       anchorYUnits: 'pixels',
                                       opacity: 0.75,
                                       src: imageBaseSrc +
                                           'resources/img/postit.png'
                                   })
                               })
                           });
                           map.addInteraction(me.drawPostitInteraction);
                       }
                       if (pressed) {
                           me.drawPostitInteraction.setActive(true);
                           me.redlineFeatures.on("add", me.handlePostitAdd, me);
                       } else {
                           me.drawPostitInteraction.setActive(false);
                           me.redlineFeatures.un("add", me.handlePostitAdd, me);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Copy Object',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.copySelectInteraction) {
                           me.copySelectInteraction =
                               new ol.interaction.Select();
                           me.copySelectInteraction.getFeatures().on('add',
                               function(evt) {

                               var copyFeature = evt.element.clone();
                               var doneFn = function(finalFeature) {
                                   me.redlineFeatures.push(finalFeature);
                               };
                               BasiGX.util.Animate.moveFeature(copyFeature, 500,
                                   100, me.getRedlineStyleFunction(), doneFn);

                               me.copySelectInteraction.getFeatures().clear();
                           });
                           map.addInteraction(me.copySelectInteraction);
                       }
                       if (pressed) {
                           me.copySelectInteraction.setActive(true);
                       } else {
                           me.copySelectInteraction.setActive(false);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Move Object',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.translateInteraction) {
                           me.translateSelectInteraction =
                               new ol.interaction.Select();
                           map.addInteraction(me.translateSelectInteraction);
                           me.translateInteraction =
                               new ol.interaction.Translate({
                                   features: me.translateSelectInteraction
                                       .getFeatures()
                           });
                           map.addInteraction(me.translateInteraction);
                       }
                       if (pressed) {
                           me.translateInteraction.setActive(true);
                           me.translateSelectInteraction.setActive(true);
                       } else {
                           me.translateInteraction.setActive(false);
                           me.translateSelectInteraction.setActive(false);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Modify Object',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.modifyInteraction) {
                           me.modifyInteraction = new ol.interaction.Modify({
                               features: me.redlineFeatures,
                               deleteCondition: function(event) {
                                   return ol.events.condition
                                       .singleClick(event);
                               }
                           });
                           map.addInteraction(me.modifyInteraction);
                       }
                       if (pressed) {
                           me.modifyInteraction.setActive(true);
                       } else {
                           me.modifyInteraction.setActive(false);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Delete Object',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.deleteSelectInteraction) {
                           me.deleteSelectInteraction =
                               new ol.interaction.Select();
                           map.addInteraction(me.deleteSelectInteraction);
                           me.deleteSelectInteraction.getFeatures().on('add',
                               function(evt) {

                               var deletedFeature = evt.element;
                               me.redlineFeatures.remove(deletedFeature);
                               evt.target.clear();
                           });
                           // for snapping we need a modify interaction...
                           me.deleteModifyInteraction =
                               new ol.interaction.Modify({
                               features: me.redlineFeatures,
                               deleteCondition: function(event) {
                                   return ol.events.condition
                                       .singleClick(event);
                               }
                           });
                           map.addInteraction(me.deleteModifyInteraction);
                           me.deleteSnapInteraction = new ol.interaction.Snap({
                               features: me.redlineFeatures
                           });
                           map.addInteraction(me.deleteSnapInteraction);
                       }
                       if (pressed) {
                           me.deleteSelectInteraction.setActive(true);
                           me.deleteModifyInteraction.setActive(true);
                           me.deleteSnapInteraction.setActive(true);
                       } else {
                           me.deleteSelectInteraction.setActive(false);
                           me.deleteModifyInteraction.setActive(false);
                           me.deleteSnapInteraction.setActive(false);
                       }
                   }
               }
           }, {
               xtype: 'button',
               text: 'Styler',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.stylerWindow) {
                           me.stylerWindow = Ext.create('Ext.window.Window', {
                               title: 'Styler',
                               width: 500,
                               layout: 'fit',
                               constrainHeader: true,
                               autoScroll: true,
                               closeAction: 'hide',
                               items: Ext.create(
                                   'BasiGX.view.container.RedlineStyler', {
                                   redliningVectorLayer: me.redliningVectorLayer,
                                   backendUrls: me.getBackendUrls()
                               })
                           });
                           me.stylerWindow.on("close", function() {
                               btn.toggle();
                           });
                       }
                       if (pressed) {
                           me.stylerWindow.show();
                       } else {
                           me.stylerWindow.hide();
                       }
                   }
               }
           }
       ];
   },

   /**
    *
    */
   handlePostitAdd: function(evt) {
       var me = this;
       var feat = evt.element;

       Ext.create('Ext.window.Window', {
           width: 300,
           height: 170,
           title: 'Enter the Post-its text',
           defaults: {
               width: '100%'
           },
           items: [
               {
                   xtype: 'textarea',
                   name: 'postittext'
               },
               {
                   xtype: 'button',
                   text: 'Create Post-it',
                   handler: function(btn) {
                       var text = btn.up('window').down(
                           'textarea[name=postittext]').getValue();
                       text = me.stringDivider(text, 16, '\n');
                       me.setPostitStyleAndTextOnFeature(text, feat);
                       btn.up('window').close();
                   }
               }
           ]
       }).show();

       var button = Ext.ComponentQuery.query('button[name=postitbutton]')[0];
       button.toggle();
   },

   /**
    * sets a postit style and text on a feature
    */
   setPostitStyleAndTextOnFeature: function(text, feat) {
       var classPath = Ext.Loader.getPath(
           'BasiGX.view.container.Redlining');
       var imageBaseSrc;
       if (classPath) {
           imageBaseSrc = classPath.split(
               'src/view/container/Redlining.js')[0];
       }
       feat.setStyle(new ol.style.Style({
           image: new ol.style.Icon({
               anchorXUnits: 'fraction',
               anchorYUnits: 'pixels',
               opacity: 0.75,
               src: imageBaseSrc + 'resources/img/postit.png'
           }),
           text: new ol.style.Text({
             text: text,
             scale: 1.5,
             offsetY: 80
           })
       }));
   },

   // http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
   stringDivider: function(str, width, spaceReplacer) {
       var me = this;
       var startIndex = 0;
       var stopIndex = width;
       if (str.length > width) {
           var p = width;
           var left;
           var right;
           while (p > 0 && (str[p] !== ' ' && str[p] !== '-')) {
               p--;
           }
           if (p > 0) {
                 if (str.substring(p, p + 1) === '-') {
                     left = str.substring(0, p + 1);
                 } else {
                     left = str.substring(0, p);
                 }
                 right = str.substring(p + 1);
                 return left + spaceReplacer + me.stringDivider(
                     right, width, spaceReplacer);
           } else {
               // no whitespace or - found, splitting hard on the width length
               left = str.substring(startIndex, stopIndex + 1) + '-';
               right = str.substring(stopIndex + 1);
               startIndex = stopIndex;
               stopIndex += width;
               return left + spaceReplacer + me.stringDivider(
                   right, width, spaceReplacer);
           }
       }
       return str;
    }
});
