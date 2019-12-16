/* Copyright (c) 2017-present terrestris GmbH & Co. KG
 * Copyright (c) 2016-present Jean-Marc Viglino
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
/* This file is basically a copy of
 * https://raw.githubusercontent.com/Viglino/ol3-ext/gh-pages/interaction/
 * transforminteraction.js by https://github.com/Viglino at commit
 * 8c92ee5c9668f3451c807f33fa4d9933eac2cd22
 * That code is licenced under the French Opensource BSD like CeCILL-B FREE
 * SOFTWARE LICENSE
 * (http://www.cecill.info/licences/Licence_CeCILL_V2.1-en.html)
 */
/**
 * A wrapper class that loads the excellent `ol.interaction.Transform` into
 * the page.
 *
 * Changes to the original class by [Viglino](https://github.com/Viglino):
 *   * Code style
 *   * Wrapped in an Ext.class, so this extension can be required from other
 *     classes
 *   * The vectorlayer for the handles has KEY_DISPLAY_IN_LAYERSWITCHER from
 *     BasiGX.util.Layer set to false
 */
Ext.define('BasiGX.ol3.extension.TransformInteraction', {
    requires: [
        'BasiGX.util.Layer'
    ],
    singleton: true
}, function() {
    // Once this class is required, this function will execute and create the
    // extension in the ol namespace.

    // some basic sanity checks
    if (!ol || !ol.interaction || !ol.interaction.Pointer) {
        Ext.log.error('Cannot define `ol.interaction.Transform`: Not ' +
            'all needed OpenLayers 3 classes present.');
        return;
    } else if ('Transform' in ol.interaction) {
        Ext.log.error('Cannot define `ol.interaction.Transform`: It is ' +
            ' defined already.');
        return;
    }

    // -------------------------------------------------------------
    // ---       Definition of the ol.interaction.Transform      ---

    /**
     * Interaction rotate
     *
     * @constructor
     * @extends {ol.interaction.Pointer}
     * @fires select
     * @fires rotatestart
     * @fires rotating
     * @fires rotateend
     * @fires translatestart
     * @fires translating
     * @fires translateend
     * @fires scalestart
     * @fires scaling
     * @fires scaleend
     * @param {olx.interaction.TransformOptions} options These are the
     *     possible keys:
     *     - layers {Array<ol.Layer>} array of layers to transform,
     *     - features {ol.Collection<ol.Feature>} collection of feature to
     *       transform,
     *     - translateFeature {bool} Translate when click on feature
     *     - translate {bool} Can translate the feature
     *     - stretch {bool} can stretch the feature
     *     - scale {bool} can scale the feature
     *     - rotate {bool} can rotate the feature
     *     - style {} list of ol.style for handles
     */
    ol.interaction.Transform = function(options) {
        if (!options) {
            options = {};
        }
        var me = this;
        // Create a new overlay layer for the sketch
        this.handles_ = new ol.Collection();
        this.overlayLayer_ = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: this.handles_,
                useSpatialIndex: false
            }),
            name: 'Transform overlay',
            displayInLayerSwitcher: false,
            // Return the style according to the handle type
            style: function(feature) {
                var key = (feature.get('handle') || 'default') +
                    (feature.get('constraint') || '') +
                    (feature.get('option') || '');
                return (me.style[key]);
            }
        });

        ol.interaction.Pointer.call(this, {
            handleDownEvent: this.handleDownEvent_,
            handleDragEvent: this.handleDragEvent_,
            handleMoveEvent: this.handleMoveEvent_,
            handleUpEvent: this.handleUpEvent_
        });

        /** Collection of feature to transform */
        this.features_ = options.features;
        /** List of layers to transform */
        var layers = null;
        if (options.layers) {
            if (options.layers instanceof Array) {
                layers = options.layers;
            } else {
                layers = [options.layers];
            }
        }
        this.layers_ = layers;

        /** Translate when click on feature */
        this.set('translateFeature', (options.translateFeature !== false));
        /** Can translate the feature */
        this.set('translate', (options.translate !== false));
        /** Can stretch the feature */
        this.set('stretch', (options.stretch !== false));
        /** Can scale the feature */
        this.set('scale', (options.scale !== false));
        /** Can rotate the feature */
        this.set('rotate', (options.rotate !== false));

        // TODO MJ: added option to keep a fixed scale when scaling at edges
        var fixedScaleRatio = false;
        if (options.fixedScaleRatio !== undefined) {
            fixedScaleRatio = options.fixedScaleRatio;
        }
        this.set('fixedScaleRatio', fixedScaleRatio);

        // Force redraw when changed
        this.on('propertychange', function() {
            this.drawSketch_();
        });

        // Change BasiGX:
        this.overlayLayer_.set(
            BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER,
            false
        );

        // setstyle
        this.setDefaultStyle();
    };
    ol.inherits(ol.interaction.Transform, ol.interaction.Pointer);

    /** Cursors for transform
    */
    ol.interaction.Transform.prototype.Cursors = {
        'default': 'auto',
        'select': 'pointer',
        'translate': 'move',
        'rotate': 'move',
        'scale': 'ne-resize',
        'scale1': 'nw-resize',
        'scale2': 'ne-resize',
        'scale3': 'nw-resize',
        'scalev': 'e-resize',
        'scaleh1': 'n-resize',
        'scalev2': 'e-resize',
        'scaleh3': 'n-resize'
    };

    /**
     * Remove the interaction from its current map, if any, and attach it to a
     * new map, if any. Pass `null` to just remove the interaction from the
     * current map.
     * @param {ol.Map} map Map.
     * @api stable
     */
    ol.interaction.Transform.prototype.setMap = function(map) {
        if (this.getMap()) {
            this.getMap().removeLayer(this.overlayLayer_);
        }
        ol.interaction.Pointer.prototype.setMap.call(this, map);
        this.overlayLayer_.setMap(map);
        // Changed MJ: added guard whether map is not null.
        // https://github.com/Viglino/ol3-ext/pull/16
        if (map !== null) {
            this.isTouch = /touch/.test(map.getViewport().className);
            this.setDefaultStyle();
        }
    };

    /**
     * Activate/deactivate interaction
     * @param {boolean} b Whether the interaction shall be active.
     * @api stable
     */
    ol.interaction.Transform.prototype.setActive = function(b) {
        ol.interaction.Pointer.prototype.setActive.call (this, b);
        if (b) {
            this.select(null);
        }
    };

    /**
     * Set default sketch style
     */
    ol.interaction.Transform.prototype.setDefaultStyle = function() { // Style
        var stroke = new ol.style.Stroke({
            color: [255, 0, 0, 1],
            width: 1
        });

        var strokedash = new ol.style.Stroke({
            color: [255, 0, 0, 1],
            width: 1,
            lineDash: [4, 4]
        });
        var fill0 = new ol.style.Fill({
            color: [255, 0, 0, 0.01]
        });
        var fill = new ol.style.Fill({
            color: [255, 255, 255, 0.8]
        });
        var circle = new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            radius: this.isTouch ? 12 : 6,
            points: 15
        });
        circle.getAnchor()[0] = this.isTouch ? -10 : -5;
        var bigpt = new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            radius: this.isTouch ? 16 : 8,
            points: 4,
            angle: Math.PI / 4
        });
        var smallpt = new ol.style.RegularShape({
            fill: fill,
            stroke: stroke,
            radius: this.isTouch ? 12 : 6,
            points: 4,
            angle: Math.PI / 4
        });
        var createStyle = function(passedImage, passedStroke, passedFill) {
            return [
                new ol.style.Style({
                    image: passedImage,
                    stroke: passedStroke,
                    fill: passedFill
                })
            ];
        };
        /** Style for handles */
        this.style = {
            'default': createStyle(bigpt, strokedash, fill0),
            'translate': createStyle(bigpt, stroke, fill),
            'rotate': createStyle(circle, stroke, fill),
            'rotate0': createStyle(bigpt, stroke, fill),
            'scale': createStyle(bigpt, stroke, fill),
            'scale1': createStyle(bigpt, stroke, fill),
            'scale2': createStyle(bigpt, stroke, fill),
            'scale3': createStyle(bigpt, stroke, fill),
            'scalev': createStyle(smallpt, stroke, fill),
            'scaleh1': createStyle(smallpt, stroke, fill),
            'scalev2': createStyle(smallpt, stroke, fill),
            'scaleh3': createStyle(smallpt, stroke, fill)
        };
        this.drawSketch_();
    };

    /**
     * Set sketch style.
     * @param {String} style The style key.
     * @param {ol.style.Style|Array<ol.style.Style>} olstyle The OpenLayers
     *     style or array of styles.
     * @api stable
     */
    ol.interaction.Transform.prototype.setStyle = function(style, olstyle) {
        if (!olstyle) {
            return;
        }
        if (olstyle instanceof Array) {
            this.style[style] = olstyle;
        } else {
            this.style[style] = [olstyle];
        }
        for (var i = 0, num = this.style[style].length; i < num; i++) {
            var im = this.style[style][i].getImage();
            if (im) {
                if (style === 'rotate') {
                    im.getAnchor()[0] = -5;
                }
                if (this.isTouch) {
                    im.setScale(1.8);
                }
            }
            var tx = this.style[style][i].getText();
            if (tx) {
                if (style === 'rotate') {
                    tx.setOffsetX(this.isTouch ? 14 : 7);
                }
                if (this.isTouch) {
                    tx.setScale(1.8);
                }
            }
        }
        this.drawSketch_();
    };

    /**
     * Get Feature at pixel
     *
     * @param {ol.Pixel} pixel The pixe to get a feature for.
     * @return {Object} An object that has the found feature at the key
     *     `feature` and possibly more information.
     * @private
     */
    ol.interaction.Transform.prototype.getFeatureAtPixel_ = function(pixel) {
        var me = this;
        // will be passed on to map.forEachFeatureAtPixel below
        var findFunction = function(feature, layer) {
            var found = false;
            // Overlay ?
            if (!layer) {
                if (feature === me.bbox_) {
                    return false;
                }
                me.handles_.forEach(function(f) {
                    if (f === feature) {
                        found = true;
                    }
                });
                if (found) {
                    return {
                        feature: feature,
                        handle: feature.get('handle'),
                        constraint: feature.get('constraint'),
                        option: feature.get('option')
                    };
                }
            }

            if (me.layers_) {
                // feature belong to a layer
                for (var i = 0, num = me.layers_.length; i < num; i++) {
                    if (me.layers_[i] === layer) {
                        return {
                            feature: feature
                        };
                    }
                }
                return null;
            } else if (me.features_) {
                // feature in the collection
                me.features_.forEach(function(f) {
                    if (f === feature) {
                        found = true;
                    }
                });
                if (found) {
                    return {feature: feature};
                } else {
                    return null;
                }
            } else {
                // Others
                return {
                    feature: feature
                };
            }
        };
        var map = me.getMap();
        var got = map.forEachFeatureAtPixel(pixel, findFunction);
        return got || {};
    };

    /**
     * Draw transform sketch
     *
     * @param {boolean} center draw only the center
     */
    ol.interaction.Transform.prototype.drawSketch_ = function(center) {
        this.overlayLayer_.getSource().clear();
        var map = this.getMap();
        var ext;
        var geom;
        var f;
        if (!this.feature_) {
            return;
        }
        if (center === true) {
            if (!this.ispt_) {
                this.overlayLayer_.getSource().addFeature(
                    new ol.Feature({
                        geometry: new ol.geom.Point(this.center_),
                        handle: 'rotate0'
                    })
                );
                ext = this.feature_.getGeometry().getExtent();
                geom = ol.geom.Polygon.fromExtent(ext);
                f = this.bbox_ = new ol.Feature(geom);
                this.overlayLayer_.getSource().addFeature(f);
            }
        } else {
            ext = this.feature_.getGeometry().getExtent();
            if (this.ispt_) {
                var p = map.getPixelFromCoordinate([ext[0], ext[1]]);
                ext = ol.extent.boundingExtent([
                    map.getCoordinateFromPixel([p[0] - 10, p[1] - 10]),
                    map.getCoordinateFromPixel([p[0] + 10, p[1] + 10])
                ]);
            }
            geom = ol.geom.Polygon.fromExtent(ext);
            f = this.bbox_ = new ol.Feature(geom);
            var features = [];
            var g = geom.getCoordinates()[0];
            if (!this.ispt_) {
                features.push(f);
                // Middle
                if (this.get('stretch') && this.get('scale')) {
                    for (var i = 0, toI = g.length - 1; i < toI; i++) {
                        f = new ol.Feature({
                            geometry: new ol.geom.Point([
                                (g[i][0] + g[i + 1][0]) / 2,
                                (g[i][1] + g[i + 1][1]) / 2
                            ]),
                            handle: 'scale',
                            constraint: i % 2 ? 'h' : 'v',
                            option: i
                        });
                        features.push(f);
                    }
                }
                // Handles
                if (this.get('scale')) {
                    for (var j = 0, toJ = g.length - 1; j < toJ; j++) {
                        f = new ol.Feature({
                            geometry: new ol.geom.Point(g[j]),
                            handle: 'scale',
                            option: j
                        });
                        features.push(f);
                    }
                }
                // Center
                if (this.get('translate') && !this.get('translateFeature')) {
                    f = new ol.Feature({
                        geometry: new ol.geom.Point([
                            (g[0][0] + g[2][0]) / 2,
                            (g[0][1] + g[2][1]) / 2
                        ]),
                        handle: 'translate'
                    });
                    features.push(f);
                }
            }
            // Rotate
            if (this.get('rotate')) {
                f = new ol.Feature({
                    geometry: new ol.geom.Point(g[3]),
                    handle: 'rotate'
                });
                features.push(f);
            }
            // Add sketch
            this.overlayLayer_.getSource().addFeatures(features);
        }
    };

    /**
     * Select a feature to transform.

     * @param {ol.Feature} feature The feature to transform.
     */
    ol.interaction.Transform.prototype.select = function(feature) {
        this.feature_ = feature;
        var geomType = this.feature_ && this.feature_.getGeometry().getType();
        this.ispt_ = geomType ? (geomType === 'Point') : false;
        this.drawSketch_();
        this.dispatchEvent({
            type: 'select',
            feature: this.feature_
        });
    };

    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `true` to start the drag sequence.
     */
    ol.interaction.Transform.prototype.handleDownEvent_ = function(evt) {
        var sel = this.getFeatureAtPixel_(evt.pixel);
        var feature = sel.feature;
        if (this.feature_ && this.feature_ === feature
            && (
                (this.ispt_ && this.get('translate'))
                || this.get('translateFeature')
            )) {
            sel.handle = 'translate';
        }
        if (sel.handle) {
            this.mode_ = sel.handle;
            this.opt_ = sel.option;
            this.constraint_ = sel.constraint;
            // Save info
            this.coordinate_ = evt.coordinate;
            this.pixel_ = evt.pixel;
            this.geom_ = this.feature_.getGeometry().clone();
            var geomExtent = this.geom_.getExtent();
            var extentPoly = ol.geom.Polygon.fromExtent(geomExtent);
            this.extent_ = extentPoly.getCoordinates()[0];
            this.center_ = ol.extent.getCenter(this.geom_.getExtent());
            this.angle_ = Math.atan2(
                this.center_[1] - evt.coordinate[1],
                this.center_[0] - evt.coordinate[0]
            );

            this.dispatchEvent({
                type: this.mode_ + 'start',
                feature: this.feature_,
                pixel: evt.pixel,
                coordinate: evt.coordinate
            });
            return true;
        } else {
            this.feature_ = feature;
            var geomType = feature && feature.getGeometry().getType();
            this.ispt_ = geomType ? (geomType === 'Point') : false;
            this.drawSketch_();
            this.dispatchEvent({
                type: 'select',
                feature: this.feature_,
                pixel: evt.pixel,
                coordinate: evt.coordinate
            });
            return false;
        }
    };


    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     */
    ol.interaction.Transform.prototype.handleDragEvent_ = function(evt) {
        var geometry;
        var deltaX;
        var deltaY;
        switch (this.mode_) {
            case 'rotate':
                deltaX = this.center_[0] - evt.coordinate[0];
                deltaY = this.center_[1] - evt.coordinate[1];
                var a = Math.atan2(deltaY, deltaX);
                if (!this.ispt) {
                    geometry = this.geom_.clone();
                    geometry.rotate(a - this.angle_, this.center_);

                    this.feature_.setGeometry(geometry);
                }
                this.drawSketch_(true);
                this.dispatchEvent({
                    type: 'rotating',
                    feature: this.feature_,
                    angle: a - this.angle_,
                    pixel: evt.pixel,
                    coordinate: evt.coordinate
                });
                break;

            case 'translate':
                deltaX = evt.coordinate[0] - this.coordinate_[0];
                deltaY = evt.coordinate[1] - this.coordinate_[1];

                this.feature_.getGeometry().translate(deltaX, deltaY);
                this.handles_.forEach(function(f) {
                    f.getGeometry().translate(deltaX, deltaY);
                });

                this.coordinate_ = evt.coordinate;
                this.dispatchEvent({
                    type: 'translating',
                    feature: this.feature_,
                    delta: [deltaX, deltaY],
                    pixel: evt.pixel,
                    coordinate: evt.coordinate
                });
                break;

            case 'scale':
                var center = this.center_;
                if (evt.originalEvent.metaKey || evt.originalEvent.ctrlKey) {
                    center = this.extent_[(Number(this.opt_) + 2) % 4];
                }

                var x1 = evt.coordinate[0] - center[0];
                var x2 = this.coordinate_[0] - center[0];
                var scx = x1 / x2;
                var y1 = evt.coordinate[1] - center[1];
                var y2 = this.coordinate_[1] - center[1];
                var scy = y1 / y2;

                // TODO added MJ, fixedScaleRatio for scaling
                var fixedScaleRatio = this.get('fixedScaleRatio');
                if (this.constraint_) {
                    // TODO added MJ, fixedScaleRatio for scaling
                    if (this.constraint_ === 'h') {
                        scx = fixedScaleRatio ? scy : 1;
                    } else {
                        scy = fixedScaleRatio ? scx : 1;
                    }
                } else {
                    if (evt.originalEvent.shiftKey || fixedScaleRatio) {
                        scx = scy = Math.min(scx, scy);
                    }
                }

                geometry = this.geom_.clone();
                geometry.applyTransform(function(g1, g2, dim) {
                    if (dim < 2) {
                        return g2;
                    }

                    for (var i = 0; i < g1.length; i += dim) {
                        if (scx !== 1) {
                            g2[i] = center[0] + (g1[i] - center[0]) * scx;
                        }
                        if (scy !== 1) {
                            g2[i + 1] = center[1] +
                                (g1[i + 1] - center[1]) * scy;
                        }
                    }
                    return g2;
                });
                this.feature_.setGeometry(geometry);
                this.drawSketch_();
                this.dispatchEvent({
                    type: 'scaling',
                    feature: this.feature_,
                    scale: [scx, scy],
                    pixel: evt.pixel,
                    coordinate: evt.coordinate
                });
                break;

            default:
                break;
        }
    };

    /**
     * @param {ol.MapBrowserEvent} evt Event.
     */
    ol.interaction.Transform.prototype.handleMoveEvent_ = function(evt) {
        // console.log("handleMoveEvent");
        if (!this.mode_) {
            var map = evt.map;
            var sel = this.getFeatureAtPixel_(evt.pixel);
            var element = map.getTargetElement();
            if (sel.feature) {
                var c;
                if (sel.handle) {
                    var key = (sel.handle || 'default') +
                        (sel.constraint || '') +
                        (sel.option || '');
                    c = this.Cursors[key];
                } else {
                    c = this.Cursors.select;
                }

                if (this.previousCursor_ === undefined) {
                    this.previousCursor_ = element.style.cursor;
                }
                element.style.cursor = c;
            } else {
                if (this.previousCursor_ !== undefined) {
                    element.style.cursor = this.previousCursor_;
                }
                this.previousCursor_ = undefined;
            }
        }
    };

    /**
     * @param {ol.MapBrowserEvent} evt Map browser event.
     * @return {boolean} `false` to stop the drag sequence.
     */
    ol.interaction.Transform.prototype.handleUpEvent_ = function(evt) {
        var deltaX = this.center_[0] - evt.coordinate[0];
        var deltaY = this.center_[1] - evt.coordinate[1];
        var a = Math.atan2(deltaY, deltaX);
        this.dispatchEvent({
            type: this.mode_ + 'end',
            angle: a - this.angle_,
            feature: this.feature_,
            oldgeom: this.geom_
        });

        this.drawSketch_();
        this.mode_ = null;
        return false;
    };

    // --- End of the definition of the ol.interaction.Transform ---
    // -------------------------------------------------------------
});
