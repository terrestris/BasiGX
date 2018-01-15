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
        'BasiGX.view.button.DigitizeModifyObject',
        'BasiGX.view.container.RedlineStyler'
    ],

    layout: 'hbox',

    /**
     *
     */
    viewModel: {
        data: {
            drawPostItBtnText: 'Draw Post-it',
            copyObjectBtnText: 'Copy Object',
            moveObjectBtnText: 'Move Object',
            deleteObjectBtnText: 'Delete Object',
            openStyleBtnText: 'Styler',
            stylerWindowTitle: 'Styler',
            postItWindowTitle: 'Enter the Post-its text',
            postItWindowCreatePostItBtnText: 'Create Post-it',
            postItInputTooLongText: 'The text you have entered is too long. ' +
                'Do you want to continue anyway?',
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
    selectInteraction: null,

    /**
     *
     */
    deleteSelectInteraction: null,

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
     * TODO This method needs to be refactored.
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
                            features: new ol.Collection(),
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
                        me.drawPostitInteraction.on('drawend',
                            me.setDefaultPostitStyle, me);
                    } else {
                        me.drawPostitInteraction.setActive(false);
                        me.drawPostitInteraction.un('drawend',
                            me.setDefaultPostitStyle, me);
                    }
                }
            }
        }, {
            xtype: 'button',
            bind: {
                text: '{copyObjectBtnText}'
            },
            name: 'copyObjectBtn',
            toggleGroup: 'draw',
            listeners: {
                toggle: function(btn, pressed) {
                    if (!me.copySelectInteraction) {
                        me.copySelectInteraction =
                           new ol.interaction.Select({
                                condition: function(evt) {
                                    return ol.events.condition.pointerMove(
                                        evt) || ol.events.condition.
                                        click(evt);
                                },
                                addCondition: function(evt) {
                                    if (evt.type === 'click') {
                                        var features = me.
                                            copySelectInteraction.
                                            getFeatures().getArray();
                                        if (features[0]) {
                                            var copyFeature = features[0].
                                                clone();
                                            var doneFn = function(
                                                finalFeature) {
                                                me.redlineFeatures.push(
                                                    finalFeature);
                                            };
                                            BasiGX.util.Animate.moveFeature(
                                                copyFeature, 500,
                                                100,
                                                me.getRedlineStyleFunction(),
                                                doneFn);

                                            me.copySelectInteraction.
                                                getFeatures().clear();
                                        }
                                    }
                                }
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
            name: 'moveObjectBtn',
            toggleGroup: 'draw',
            listeners: {
                toggle: function(btn, pressed) {
                    if (!me.translateInteraction) {
                        me.translateSelectInteraction =
                           new ol.interaction.Select({
                                condition: ol.events.condition.pointerMove,
                                addCondition: function() {
                                    var selectedFeatures =
                                      me.translateSelectInteraction.
                                          getFeatures();
                                    var firstFeature = selectedFeatures.
                                        getArray()[0];

                                    if (firstFeature) {
                                        var redlineFeature = me.
                                            getRedlineFeatureFromClone(
                                                firstFeature);

                                        if (me.translateFeatureCollection.
                                            getLength() === 0) {
                                            me.translateFeatureCollection.
                                                push(redlineFeature);
                                        } else if (me.
                                            translateFeatureCollection.
                                            getLength() > 0 &&
                                           redlineFeature !== me.
                                               translateFeatureCollection.
                                               getArray()[0]) {
                                            me.
                                                translateFeatureCollection.
                                                clear();
                                            me.
                                                translateFeatureCollection.
                                                push(redlineFeature);
                                        }
                                    }
                                }
                            });
                        me.map.addInteraction(me.translateSelectInteraction);
                        me.translateFeatureCollection = new ol.Collection();
                        me.translateInteraction =
                           new ol.interaction.Translate({
                                features: me.translateFeatureCollection
                            });
                        me.map.addInteraction(me.translateInteraction);
                    }
                    if (pressed) {
                        me.translateInteraction.setActive(true);
                        me.translateSelectInteraction.setActive(true);
                        me.translateInteraction.on('translateend',
                            me.fireRedliningChanged, me);
                    } else {
                        me.translateInteraction.setActive(false);
                        me.translateSelectInteraction.setActive(false);
                        me.translateInteraction.un('translateend',
                            me.fireRedliningChanged, me);
                    }
                }
            }
        }, {
            xtype: 'basigx-button-digitize-modify-object',
            map: me.map,
            collection: me.redlineFeatures,
            listeners: {
                'redliningchanged': me.fireRedliningChanged
            }
        }, {
            xtype: 'button',
            bind: {
                text: '{deleteObjectBtnText}'
            },
            name: 'deleteObjectBtn',
            toggleGroup: 'draw',
            listeners: {
                toggle: function(btn, pressed) {
                    if (!me.deleteSelectInteraction) {
                        var removeFeatures = function(selectedFeatures) {
                            // find the matching feature in redlining layer
                            selectedFeatures.forEach(function(selectedFeature) {
                                var feature = me.getRedlineFeatureFromClone(
                                    selectedFeature
                                );
                                if (feature) {
                                    me.redlineFeatures.remove(feature);
                                }
                                me.deleteSelectInteraction.getFeatures().
                                    remove(selectedFeature);
                                me.map.renderSync();
                            });
                        };
                        me.deleteSelectInteraction = new ol.interaction.Select({
                            condition: function(evt) {
                                return ol.events.condition.pointerMove(evt) ||
                                        ol.events.condition.click(evt);
                            },
                            addCondition: function(evt) {
                                if (evt.type === 'click') {
                                    var selectedFeatures =
                                        me.deleteSelectInteraction.
                                            getFeatures();
                                    removeFeatures(selectedFeatures, evt);
                                }
                            }
                        });
                        me.map.addInteraction(me.deleteSelectInteraction);

                        me.deleteSnapInteraction = new ol.interaction.Snap({
                            features: me.redlineFeatures
                        });
                        me.map.addInteraction(me.deleteSnapInteraction);
                    }
                    if (pressed) {
                        me.deleteSelectInteraction.setActive(true);
                        me.deleteSnapInteraction.setActive(true);
                    } else {
                        me.deleteSelectInteraction.setActive(false);
                        me.deleteSnapInteraction.setActive(false);
                    }
                }
            }
        }, {
            xtype: 'button',
            bind: {
                text: '{openStyleBtnText}'
            },
            name: 'openStyleBtn',
            toggleGroup: 'draw',
            listeners: {
                toggle: function(btn, pressed) {
                    if (!me.stylerWindow) {
                        var redliningVectorLayer = me.redliningVectorLayer;
                        me.stylerWindow = Ext.create('Ext.window.Window', {
                            title: me.getViewModel().get('stylerWindowTitle'),
                            width: 500,
                            layout: 'fit',
                            constrainHeader: true,
                            autoScroll: true,
                            closeAction: 'hide',
                            items: Ext.create(
                                'BasiGX.view.container.RedlineStyler', {
                                    redliningVectorLayer: redliningVectorLayer,
                                    backendUrls: me.getBackendUrls(),
                                    redlinePointStyle:
                                        me.getRedlinePointStyle(),
                                    redlineLineStringStyle:
                                   me.getRedlineLineStringStyle(),
                                    redlinePolygonStyle:
                                   me.getRedlinePolygonStyle()
                                })
                        });
                        me.stylerWindow.on('close', function() {
                            me.fireRedliningChanged();
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
        }];
    },

    /**
     * Returns a usable image `src` for the postit; this will either be the
     * configured one (#postitPictureUrl), or it will be tried to be determined
     * from the path of the sourcefile of the redlining component itself (which
     * might be error-prone).
     *
     * The safest bet is to configure an explicit `postitPictureUrl`.
     *
     * @return {String} A image `src` for the postit image.
     */
    getPostitImgSrc: function() {
        if (this.getPostitPictureUrl() !== null) {
            return this.getPostitPictureUrl();
        } else {
            var classPath = Ext.Loader.getPath(
                'BasiGX.view.container.Redlining'
            );
            var imageBaseSrc;
            if (classPath) {
                imageBaseSrc = classPath.split(
                    'src/view/container/Redlining.js')[0];
            }
            return imageBaseSrc + 'resources/img/postit.png';
        }
    },

    /**
     * Called after a postit is drawn, this will set a default postit style.
     *
     * @param {ol.interaction.Draw.Event} evt The `drawend`-event.
     */
    setDefaultPostitStyle: function(evt) {
        var me = this;
        var feature = evt.feature;
        if (feature) {
            feature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.75,
                    src: me.getPostitImgSrc()
                })
            }));
            var clone = evt.feature.clone();
            me.handlePostitAdd(clone);
        }
    },

    /**
     * Handles adding of a new postit.
     *
     * @param {ol.Feature} feat The vector feature.
     * @param {String} oldText The old text of the postit.
     */
    handlePostitAdd: function(feat, oldText) {
        var me = this;

        feat.set('isPostit', true);

        BasiGX.prompt(me.getViewModel().get('postItWindowTitle'), {
            fn: function(decision, text) {
                if (decision === 'cancel') {
                    me.redlineFeatures.remove(feat);
                } else {
                    if (text.length > me.postitTextMaxLength) {
                        BasiGX.confirm(me.getViewModel().get(
                            'postItInputTooLongText'), {
                            fn: function(choice) {
                                if (choice === 'yes') {
                                    text = me.stringDivider(text, 16, '\n');
                                    me.setPostitStyleAndTextOnFeature(
                                        text, feat);
                                } else {
                                    me.handlePostitAdd(feat, text);
                                }
                            }
                        }
                        );
                    } else {
                        text = me.stringDivider(text, 16, '\n');
                        me.setPostitStyleAndTextOnFeature(text, feat);
                    }
                }
            },
            multiline: 150,
            value: oldText
        });

        var button = Ext.ComponentQuery.query('button[name=postitbutton]')[0];
        button.toggle(false);
    },

    /**
     * Sets a postit style and text on a feature.
     *
     * @param {String} text The text of the postit.
     * @param {ol.Feature} feat The vector feature.
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
        me.redlineFeatures.push(feat);
    },

    /**
     * @param {ol.Feature} clone The feature to get the redline feature from.
     * @return {ol.Feature} The redline feature derived from the `clone`.
     */
    getRedlineFeatureFromClone: function(clone) {
        var redlineFeature;
        var wktParser = new ol.format.WKT();
        var cloneWktString = wktParser.writeFeature(clone);
        Ext.each(this.redlineFeatures.getArray(), function(feature) {
            var redlineFeatureWktString = wktParser.writeFeature(feature);
            if (cloneWktString === redlineFeatureWktString) {
                redlineFeature = feature;
                return false;
            }
        });
        return redlineFeature;
    },

    /**
     * Returns a string that is wrapped: every ~`width` chars a space is
     * replaced with the passed `spaceReplacer`.
     *
     * See http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
     *
     * @param {String} str The string to wrap.
     * @param {Number} width The width of a line (number of characters).
     * @param {String} spaceReplacer The string to replace spaces with.
     * @return {String} The 'wrapped' string.
     */
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

        // reapply the styleFn on the layer so that ol3 starts redrawing
        // with new styles
        me.redliningVectorLayer.setStyle(me.redliningVectorLayer.getStyle());

        me.stateChangeActive = false;
    },

    fireRedliningChanged: function() {console.log("asd");
        this.fireEvent('redliningchanged', this, this.getState(),
            this.stateChangeActive);
    }
});
