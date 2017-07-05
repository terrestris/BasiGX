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
 * @class BasiGX.plugin.Hover
 */
Ext.define('BasiGX.plugin.Hover', {
    extend: 'Ext.plugin.Abstract',

    alias: 'plugin.hover',
    pluginId: 'hover',

    inheritableStatics: {
        HOVER_OVERLAY_IDENTIFIER_KEY: 'name',
        HOVER_OVERLAY_IDENTIFIER_VALUE: 'featureinfooverlay',

        /**
         * The property of a layer that holds a boolean value which indicates
         * whether this layer qualifies for hovering.
         *
         * @type {String}
         */
        LAYER_HOVERABLE_PROPERTY_NAME: 'hoverable',

        /**
         * The property of a layer that holds a string value which indicates,
         * which field of the layer shall be shown when hovering.
         *
         * @type {String}
         */
        LAYER_HOVERFIELD_PROPERTY_NAME: 'hoverField',

        /**
         * The prefix used in a regular expression to match any placeholder
         * field in the hover template.
         *
         * @type {String}
         */
        HOVER_TEMPLATE_PLACEHOLDER_PREFIX: '\{\{',

        /**
         * The suffix used in a regular expression to match any placeholder
         * field in the hover template.
         *
         * @type {String}
         */
        HOVER_TEMPLATE_PLACEHOLDER_SUFFIX: '\}\}'
    },

    config: {
        pointerRest: true,
        pointerRestInterval: 300,
        pointerRestPixelTolerance: 5,
        featureInfoEpsg: 'EPSG:3857',
        hoverVectorLayerSource: null,
        hoverVectorLayer: null,
        hoverVectorLayerInteraction: null,
        dynamicHoverColor: false,
        enableHoverSelection: true
    },

    /**
     * Whether the `ol.interaction.Select` shall be configured to select
     * multiple features from the hover layer.
     *
     * @property {boolean}
     * @cfg
     */
    selectMulti: true,

    /**
     * The origin of the select event. We support two origins:
     *
     * * `'collection'` (the current default), which fires whenever an `add`
     *   event of the collection of selected features is fired, and
     * * `'interaction'` which fires when the select interaction fires the
     *   select event.
     *
     * Older versions of ol3 did not expose / have the latter event, and
     * therefore the 'workaround' with the collection events was chosen.
     *
     * @property {string}
     * @cfg
     */
    selectEventOrigin: 'collection',

    currentHoverTarget: null,

    pendingRequest: null,

    init: function(cmp) {
        var me = this;

        me.checkSelectEventOrigin();

        me.addHoverVectorLayerSource();
        me.addHoverVectorLayer();

        if (me.getEnableHoverSelection()) {
            me.addHoverVectorLayerInteraction();
        }

        me.setupMapEventListeners();
        this.setCmp(cmp);

        cmp.setPointerRest(this.getPointerRest());
        cmp.setPointerRestInterval(this.getPointerRestInterval());
        cmp.setPointerRestPixelTolerance(this.getPointerRestPixelTolerance());

        cmp.on('pointerrest', me.onPointerRest, me);
        cmp.on('pointerrestout', me.cleanupHoverArtifacts, me);
    },

    /**
     * Called during the initialisation phase, this methdo ensures that the
     * configuration option #selectEventOrigin has a valid value; e.g. either
     * is `'collection'` (historical default) or `'interaction'`.
     */
    checkSelectEventOrigin: function() {
        var me = this;
        var allowedOrigins = ['collection', 'interaction'];
        var defaultOrigin = allowedOrigins[0];
        var selOrigin = me.selectEventOrigin;
        if (!Ext.Array.contains(allowedOrigins, selOrigin)) {
            Ext.log.warn('Unexpected selectEventOrigin "' + selOrigin + '",' +
                ' correcting to "' + defaultOrigin + '".');
            me.selectEventOrigin = defaultOrigin;
        }
    },

    /**
     * Adds any relevant listeners on the ol.Map. For now we only ensure that
     * when the top-level layerGroup changes (e.g. by adding or removing a
     * layer), we cleanup any visual artifacts from hovering.
     *
     * @private
     */
    setupMapEventListeners: function() {
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
                multi: me.selectMulti,
                style: me.selectStyleFunction,
                layers: [me.getHoverVectorLayer()]
            });
            if (me.selectEventOrigin === 'collection') {
                var featureCollection = interaction.getFeatures();
                featureCollection.on('add', me.onFeatureClicked, me);
            } else {
                interaction.on('select', me.onFeatureClicked, me);
            }
            map.addInteraction(interaction);
            me.setHoverVectorLayerInteraction(interaction);
        }
    },

    /**
    * Bound to either a collection- or select-interaction-event, this method
    * fires the `hoverfeaturesclick` event on the map component.
    *
    * @param {ol.Collection.Event|ol.interaction.Select.Event} olEvt The event
    *     we listen to. Is dependend on #selectEventOrigin.
    */
    onFeatureClicked: function(olEvt) {
        var me = this;
        var mapComponent = me.getCmp();
        var olFeatures;
        if (me.selectEventOrigin === 'collection') {
            olFeatures = olEvt.target.getArray();
        } else {
            olFeatures = olEvt.selected;
        }
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
                visible: true,
                zIndex: 1000
            });
            map.addLayer(hoverVectorLayer);
            me.setHoverVectorLayer(hoverVectorLayer);
        }
        // Set our internal flag to filter this layer out of the tree / legend
        var inLayerSwitcherKey = BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
        hoverVectorLayer.set(inLayerSwitcherKey, false);
    },

    /**
     * Aborts pending AJAX requests, if any.
     */
    clearPendingRequests: function() {
        var me = this;
        if (me.pendingRequest) {
            Ext.Ajax.abort(me.pendingRequest);
        }
    },

    /**
     * Requests the passed `url` asynchrounously and calls `cb` when that call
     * was successful.
     *
     * @param {String} url The URL to request.
     * @param {Function} cb The callback to execute when the call succeeded.
     */
    requestAsynchronously: function(url, cb) {
        var me = this;

        me.pendingRequest = Ext.Ajax.request({
            url: url,
            callback: function() {
                me.pendingRequest = null;
            },
            success: cb,
            failure: function(resp) {
                if (!resp.aborted) {
                    Ext.log.error('Couldn\'t get FeatureInfo', resp);
                }
            }
        });
    },

    /**
     *
     */
    cleanupHoverArtifacts: function() {
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
     * The handler for the pointerrest event on the mapcomponent.
     *
     * @param {ol.MapBrowserEvent} evt The original and most recent
     *     MapBrowserEvent event.
     */
    onPointerRest: function(evt) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var mapView = map.getView();
        var pixel = evt.pixel;
        var hoverableProp = me.self.LAYER_HOVERABLE_PROPERTY_NAME;
        var hoverLayers = [];
        var hoverFeatures = [];

        me.cleanupHoverArtifacts();

        map.forEachLayerAtPixel(pixel, function(layer, pixelValues) {
            var source = layer.getSource();
            var resolution = mapView.getResolution();
            var projCode = mapView.getProjection().getCode();
            var hoverable = layer.get(hoverableProp);

            // a layer will NOT be requested for hovering if there is a
            // "hoverable" property set to false. If this property is not set
            // or has any other value than "false", the layer will be requested
            if (hoverable !== false) {
                if (source instanceof ol.source.TileWMS
                        || source instanceof ol.source.ImageWMS) {
                    // me.cleanupHoverArtifacts();
                    var url = source.getGetFeatureInfoUrl(
                        evt.coordinate,
                        resolution,
                        projCode,
                        {
                            'INFO_FORMAT': 'application/json',
                            'FEATURE_COUNT': 50
                        }
                    );

                    me.requestAsynchronously(url, function(resp) {
                        // TODO: replace evt/coords with real response geometry
                        var respFeatures = (new ol.format.GeoJSON())
                            .readFeatures(resp.responseText);
                        var respProjection = (new ol.format.GeoJSON())
                            .readProjection(resp.responseText);

                        me.showHoverFeature(
                            layer, respFeatures, respProjection
                        );

                        Ext.each(respFeatures, function(feature) {
                            feature.set('layer', layer);
                            var featureStyle = me.highlightStyleFunction(
                                feature, resolution, pixelValues);
                            feature.setStyle(featureStyle);
                            hoverFeatures.push(feature);
                        });

                        hoverLayers.push(layer);

                        me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
                    });
                } else if (source instanceof ol.source.Vector) {
                    // VECTOR!
                    map.forEachFeatureAtPixel(pixel, function(feat) {
                        if (layer.get('type') === 'WFS' ||
                                layer.get('type') === 'WFSCluster') {
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
                    }, me, function(vectorCand) {
                        return vectorCand === layer;
                    });
                }
            }
        }, this, me.hoverLayerFilter, this);

        me.showHoverToolTip(evt, hoverLayers, hoverFeatures);
    },

    /**
     * @param {ol.layer.Base} candidate The layer to check.
     * @return {Boolean} Whether the passed layer should be hoverable.
     */
    hoverLayerFilter: function(candidate) {
        var me = this;
        var hoverableProp = me.self.LAYER_HOVERABLE_PROPERTY_NAME;
        if (candidate.get(hoverableProp) ||
                candidate.get('type') === 'WFSCluster') {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Adds the passed features to the hover vector layer.
     *
     * @param {ol.layer.Layer} layer The layer. Currently unused in the method.
     * @param {Array<ol.Feature>} features The features to hover by adding them
     *     to the source of the hover vector layer.
     * @param {ol.Projection} projection The projection of the features.
     */
    showHoverFeature: function(layer, features, projection) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var proj = me.getFeatureInfoEpsg();
        if (projection) {
            proj = projection;
        }
        var source = me.getHoverVectorLayerSource();
        Ext.each(features, function(feat) {
            var g = feat.getGeometry();
            if (g) {
                g.transform(proj, map.getView().getProjection());
            }
            if (!Ext.Array.contains(source.getFeatures(),
                feat)) {
                source.addFeature(feat);
            }
        });
    },

    /**
     * Shows the hover tooltip.
     *
     * @param {ol.MapBrowserEvent} evt The OpenLayers event, containing e.g.
     *     the coordinate.
     * @param {Array<ol.layer.Layer>} layers The layers that the features may
     *     originate from.
     * @param {Array<ol.Feature>} features The features that were hovered.
     */
    showHoverToolTip: function(evt, layers, features) {
        var me = this;
        var overlayIdentifierKey = me.self.HOVER_OVERLAY_IDENTIFIER_KEY;
        var overlayIdentifierVal = me.self.HOVER_OVERLAY_IDENTIFIER_VALUE;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var coords = evt.coordinate;

        if (layers.length > 0 && features.length > 0) {
            map.getOverlays().forEach(function(o) {
                if (o.get(overlayIdentifierKey) === overlayIdentifierVal) {
                    map.removeOverlay(o);
                }
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
     * Given a set of `layers` and features that stem from these, get the HTML
     * for the tooltip.
     *
     * @param {Array<ol.layer.Base>} layers The layers from which the features
     *     stem.
     * @param {Array<ol.Feature>} features The features that were hovered.
     * @return {String} The HTML for the tooltip.
     */
    getToolTipHtml: function(layers, features) {
        var me = this;
        var innerHtml = '';
        var hoverfieldProp = me.self.LAYER_HOVERFIELD_PROPERTY_NAME;

        Ext.each(features, function(feat) {
            var layer = feat.get('layer');
            var hoverFieldProp = layer.get(hoverfieldProp);

            var hoverText = me.getHoverTextFromTemplate(feat, hoverFieldProp);

            innerHtml += '<b>' + layer.get('name') + '</b>';

            // we check for existing feature here as there maybe strange
            // situations (e.g. when zooming in unfavorable situations) where
            // feat is undefined
            if (feat) {
                if (layer.get('type') === 'WFSCluster') {
                    var count = feat.get('count');
                    innerHtml += '<br />' + count + '<br />';
                } else {
                    innerHtml += '<br />' + hoverText + '<br />';
                }
            }
        });

        return innerHtml;
    },

    /**
     * Returns another variant of the passed `baseColor` with the passed
     * `alpha` value. This can be used to get e.g. a half transparent reddish
     * color from a true red. If no `alpha` is passed, `1` is assumed. One
     * could therefore effectively use this to turn a half-transparent reddish
     * color into true red by simply no passing an alpha.
     *
     * @param {Array<Number>} baseColor An array of three (or four) numbers for
     *     the `r`, `g`, `b` (and `a`) parts of a color. All of `r`, `g` and `b`
     *     range from `0` to `255`, only integer values make sense. If passed,
     *     `a` should be between `0` and `1`, and can be fractional.
     * @param {Number} alpha The new `alpha` value. Should be between `0` and
     *     `1`, and can be fractional.
     * @return {String} The new color as string, in `rgba(r, g, b, a)`-format.
     */
    transparify: function(baseColor, alpha) {
        var rgbaTemplate = 'rgba({0}, {1}, {2}, {3})';
        var fallbackBaseColor = [255, 0, 0];
        var red;
        var green;
        var blue;

        if (baseColor.length === 4 && Ext.isNumber(baseColor[0]) &&
                Ext.isNumber(baseColor[1]) && Ext.isNumber(baseColor[2])) {
            red = baseColor[0];
            green = baseColor[1];
            blue = baseColor[2];
        } else {
            red = fallbackBaseColor[0];
            green = fallbackBaseColor[1];
            blue = fallbackBaseColor[2];
        }

        return Ext.String.format(rgbaTemplate, red, green, blue, alpha || 1);
    },

    /**
     * An OpenLayers style function that highlights the passed feature.
     *
     * @param {ol.Feature} feature The feature to highlight.
     * @param {Number} resolution The resolution the features is rendered in.
     * @param {Array<Number>} baseColor The base color for highlighting.
     * @return {Array<ol.style.Style>} The styles to use to highlight the
     *     feature.
     */
    highlightStyleFunction: function(feature, resolution, baseColor) {
        var me = this;
        var count = feature.get('count');
        var hoverColor = 'rgba(255, 0, 0, 0.6)';
        var dynamicHoverColor = me.getDynamicHoverColor();
        var radius = 14;
        var fontSize = 10;

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
                    color: dynamicHoverColor ?
                        me.transparify(baseColor, 0.3) : hoverColor
                }),
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: dynamicHoverColor ?
                            me.transparify(baseColor, 0.4) : hoverColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: dynamicHoverColor ?
                            me.transparify(baseColor, 0.6) : hoverColor
                    })
                }),
                stroke: new ol.style.Stroke({
                    color: dynamicHoverColor ?
                        me.transparify(baseColor, 0.5) : hoverColor,
                    width: 5
                }),
                text: new ol.style.Text({
                    text: count > 1 ? count.toString() : '',
                    font: 'bold ' + fontSize * 2 + 'px Arial',
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    fill: new ol.style.Fill({
                        color: 'white'
                    })
                })
            })
        ];
    },

    /**
     * An OpenLayers style function for selected features.
     *
     * @param {ol.Feature} feature The feature that was selected.
     * @return {Array<ol.style.Style>} The styles to use to style the feature.
     */
    selectStyleFunction: function(feature) {
        var count = feature.get('count');
        var radius = 14;
        var fontSize = 10;

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
                    color: 'rgba(0, 0, 255, 0.6)'
                }),
                image: new ol.style.Circle({
                    radius: radius,
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.6)'
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
                    fill: new ol.style.Fill({
                        color: 'white'
                    })
                })
            })
        ];
    },

    /**
     * Highlights a hovered cluster feature at the passed `pixel`, if any.
     *
     * @param {ol.Pixel} pixel An array with two numbers representing the pixel
     *     to check for a feature.
     */
    hoverClusterFeatures: function(pixel) {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var wmsHoverPlugin = mapComponent.getPlugin('wmshover');

        var feature = map.forEachFeatureAtPixel(pixel, function(feat) {
            return feat;
        });

        if (feature === me.highlightFeature || !feature) {
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
    },

    /**
     * Returns the hover text for the passed `feature` and `hoverTemplate`.
     *
     * @param {ol.Feature} feature The feature that was hovered.
     * @param {String} hoverTemplate The template to fill with feature
     *     attributes.
     * @return {String} The text for the hovered feature.
     */
    getHoverTextFromTemplate: function(feature, hoverTemplate) {
        var me = this;
        var placeHolderPrefix = me.self.HOVER_TEMPLATE_PLACEHOLDER_PREFIX;
        var placeHolderSuffix = me.self.HOVER_TEMPLATE_PLACEHOLDER_SUFFIX;
        var hoverText = '';

        // Set the hoverfield for the popup, if set
        if (feature && hoverTemplate) {
            // Find any character between two braces (including the braces in
            // the result)
            var regExp = new RegExp(placeHolderPrefix + '(.*?)' +
                    placeHolderSuffix, 'g');
            var regExpRes = hoverTemplate.match(regExp);

            // If we have a regex result, it means we found a placeholder in
            // the template and have to replace the placeholder with its
            // appropriate value
            if (regExpRes) {
                // Iterate over all regex match results and find the proper
                // attribute for the given placeholder, finally set the desired
                // value to the hover field text
                Ext.each(regExpRes, function(res) {
                    // We count every non matching candidate. If this count is
                    // equal to the objects length, we assume that there is no
                    // match at all and set the output value to an empty value
                    var noMatchCnt = 0;

                    Ext.iterate(feature.getProperties(), function(k, v) {
                        // Remove the suffixes and find the matching attribute
                        // column
                        var placeHolderPrefixLength = decodeURIComponent(
                            placeHolderPrefix).length;
                        var placeHolderSuffixLength = decodeURIComponent(
                            placeHolderSuffix).length;
                        var placeHolderName = res.slice(placeHolderPrefixLength,
                            res.length - placeHolderSuffixLength);
                        if (placeHolderName === k) {
                            hoverTemplate = hoverTemplate.replace(res, v);
                            return false;
                        } else {
                            noMatchCnt++;
                        }
                    });

                    // No key match found for this feature (e.g. if key not
                    // present or value is null)
                    if (noMatchCnt === Ext.Object.getSize(feature.attributes)) {
                        hoverTemplate = hoverTemplate.replace(res, '');
                    }
                });
            } else if (!Ext.isEmpty(feature.get(hoverTemplate))) {
                // If we couldn't find any match, the hoverTemplate could be a
                // simple string containing the "hoverField". To obtain
                // backwards-compatibility, we check if this field is present
                // and set the hoverText accordingly
                hoverTemplate = feature.get(hoverTemplate);
            } else {
                // Try to use "id" as fallback. If "id" is not available, the
                // value will be "undefined"
                hoverText = feature.get('id');
            }

            hoverText = hoverTemplate;
        }

        // Replace all newline breaks with a html <br> tag
        if (Ext.isString(hoverText)) {
            hoverText = hoverText.replace(/\n/g, '<br>');
        }

        return hoverText;
    }

});
