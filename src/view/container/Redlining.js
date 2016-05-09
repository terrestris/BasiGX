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
    viewModel: {
        data: {
            drawPointsBtnText: 'Draw Points',
            drawLinesBtnText: 'Draw Lines',
            drawPolygonsBtnText: 'Draw Polygons',
            drawPostItBtnText: 'Draw Post-it',
            copyObjectBtnText: 'Copy Object',
            moveObjectBtnText: 'Move Object',
            modifyObjectBtnText: 'Modify Object',
            deleteObjectBtnText: 'Delete Object',
            openStyleBtnText: 'Styler',
            stylerWindowTitle: 'Styler',
            postItWindowTitle: 'Enter the Post-its text',
            postItWindowCreatePostItBtnText: 'Create Post-it'
        }
    },

    /**
     *
     */
    drawPointInteraction : null,

    /**
     *
     */
    drawLineInteraction : null,

    /**
     *
     */
    drawPolygonInteraction : null,

    /**
     *
     */
    drawPostitInteraction : null,

    /**
     *
     */
    copySelectInteraction : null,

    /**
     *
     */
    translateInteraction : null,

    /**
     *
     */
    translateSelectInteraction : null,

    /**
     *
     */
    modifyInteraction : null,

    /**
     *
     */
    selectInteraction : null,

    /**
     *
     */
    deleteSelectInteraction : null,

    /**
     *
     */
    deleteModifyInteraction : null,

    /**
     *
     */
    deleteSnapInteraction : null,

    /**
     *
     */
    redliningVectorLayer : null,

    /**
     *
     */
    redlineFeatures : null,

    /**
     *
     */
    redliningToolsWin : null,

    /**
     *
     */
    map: null,

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
        * The URL to a picture used for the postits.
        * It is highly recommended that you set your own image source here
        */
       postitPictureUrl: null,

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
       var displayInLayerSwitcherKey = BasiGX.util.Layer.
           KEY_DISPLAY_IN_LAYERSWITCHER;

       //set map
       me.map = BasiGX.util.Map.getMapComponent().getMap();

       if (!me.redliningVectorLayer) {
           me.redlineFeatures = new ol.Collection();
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

   /**
    *
    */
   getRedlineItems: function() {
       var me = this;

       return [
           {
               xtype: 'button',
               bind: {
                   text: '{drawPointsBtnText}'
               },
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawPointInteraction) {
                           me.drawPointInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'Point'
                           });
                           me.map.addInteraction(me.drawPointInteraction);
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
               bind: {
                   text: '{drawLinesBtnText}'
               },
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawLineInteraction) {
                           me.drawLineInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'LineString'
                           });
                           me.map.addInteraction(me.drawLineInteraction);
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
               bind: {
                   text: '{drawPolygonsBtnText}'
               },
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawPolygonInteraction) {
                           me.drawPolygonInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'Polygon'
                           });
                           me.map.addInteraction(me.drawPolygonInteraction);
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
               bind: {
                   text: '{drawPostItBtnText}'
               },
               name: 'postitbutton',
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.drawPostitInteraction) {
                           var src = me.getPostitImgSrc();

                           me.drawPostitInteraction = new ol.interaction.Draw({
                               features: me.redlineFeatures,
                               type: 'Point',
                               style: new ol.style.Style({
                                   image: new ol.style.Icon({
                                       anchorXUnits: 'fraction',
                                       anchorYUnits: 'pixels',
                                       opacity: 0.75,
                                       src: src
                                   })
                               })
                           });
                           me.map.addInteraction(me.drawPostitInteraction);
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
               bind: {
                   text: '{copyObjectBtnText}'
               },
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
                           me.map.addInteraction(me.copySelectInteraction);
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
               bind: {
                   text: '{moveObjectBtnText}'
               },
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.translateInteraction) {
                           me.translateSelectInteraction =
                               new ol.interaction.Select();
                           me.map.addInteraction(me.translateSelectInteraction);
                           me.translateInteraction =
                               new ol.interaction.Translate({
                                   features: me.translateSelectInteraction
                                       .getFeatures()
                           });
                           me.map.addInteraction(me.translateInteraction);
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
               bind: {
                   text: '{modifyObjectBtnText}'
               },
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
                           me.map.addInteraction(me.modifyInteraction);
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
               bind: {
                   text: '{deleteObjectBtnText}'
               },
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.deleteSelectInteraction) {
                           me.deleteSelectInteraction =
                               new ol.interaction.Select();
                           me.map.addInteraction(me.deleteSelectInteraction);
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
                           me.map.addInteraction(me.deleteModifyInteraction);
                           me.deleteSnapInteraction = new ol.interaction.Snap({
                               features: me.redlineFeatures
                           });
                           me.map.addInteraction(me.deleteSnapInteraction);
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
               bind: {
                   text: '{openStyleBtnText}'
               },
               toggleGroup: 'draw',
               listeners: {
                   toggle: function(btn, pressed) {
                       if (!me.stylerWindow) {
                           me.stylerWindow = Ext.create('Ext.window.Window', {
                               title: me.getViewModel().get('stylerWindowTitle'),
                               width: 500,
                               layout: 'fit',
                               constrainHeader: true,
                               autoScroll: true,
                               closeAction: 'hide',
                               items: Ext.create(
                                   'BasiGX.view.container.RedlineStyler', {
                                   redliningVectorLayer: me.redliningVectorLayer,
                                   backendUrls: me.getBackendUrls(),
                                   redlinePointStyle: me.getRedlinePointStyle(),
                                   redlineLineStringStyle:
                                       me.getRedlineLineStringStyle(),
                                   redlinePolygonStyle:
                                       me.getRedlinePolygonStyle()
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
   getPostitImgSrc: function() {
       if (this.getPostitPictureUrl() !== null) {
           return this.getPostitPictureUrl();
       } else {
           var classPath = Ext.Loader.getPath(
               'BasiGX.view.container.Redlining');
           var imageBaseSrc;
           if (classPath) {
               imageBaseSrc = classPath.split(
                   'src/view/container/Redlining.js')[0];
           }
           return imageBaseSrc + 'resources/img/postit.png';
       }
   },

   /**
    *
    */
   handlePostitAdd: function(evt) {
       var me = this;
       var feat = evt.element;

       BasiGX.prompt(me.getViewModel().get('postItWindowTitle'), {
           fn: function(decision, text) {
               if (decision === "cancel") {
                   me.redlineFeatures.remove(feat);
               } else {
                   text = me.stringDivider(text, 16, '\n');
                   me.setPostitStyleAndTextOnFeature(text, feat);
               }
           },
           multiline: 150
       });

       var button = Ext.ComponentQuery.query('button[name=postitbutton]')[0];
       button.toggle();
   },

   /**
    * sets a postit style and text on a feature
    */
   setPostitStyleAndTextOnFeature: function(text, feat) {
       var me = this;
       feat.setStyle(new ol.style.Style({
           image: new ol.style.Icon({
               anchorXUnits: 'fraction',
               anchorYUnits: 'pixels',
               opacity: 0.75,
               src: me.getPostitImgSrc()
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
    },

    /**
     * Method return the current state of the redlining, containing all features
     * and the configured styles
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
     * Method sets the state of the redlining, containing drawn features
     * and the configured styles
     */
    setState: function(state) {
        var me = this;
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

        // reapply the styleFn on the layer so that ol3 starts redrawing
        // with new styles
        me.redliningVectorLayer.setStyle(me.redliningVectorLayer.getStyle());
    }
});
