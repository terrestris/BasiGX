Ext.define('BasiGX.plugin.HoverClick', {
    extend: 'BasiGX.plugin.Hover',

    alias: 'plugin.hoverClick',
    pluginId: 'hoverClick',

    inheritableStatics: {
        /**
         * The property of a layer that holds a boolean value which indicates
         * whether this layer qualifies for clicking.
         */
        LAYER_CLICKABLE_PROPERTY_NAME: 'clickable'
    },

    config: {
        /**
         * Enable/Disable hovering globally. If false, the plugin will not
         * listen to any hover event, regardless if a layer has a truthy
         * hoverable property.
         */
        hoverable: true,
        /**
         * Enable/Disable clicking globally. If false, the plugin will not
         * listen to any click event, regardless if a layer has a truthy
         * clickable property.
         */
        clickable: true,

        /**
         * Control state of click event on the map. If the underlying HSI button
         * gets untoggled, click interaction on the map should be deactivated.
         */
        clickActive: true
    },

    init: function (cmp) {
        var me = this;

        me.checkSelectEventOrigin();

        me.addHoverVectorLayerSource();
        me.addHoverVectorLayer();

        if (me.getEnableHoverSelection() && me.getClickable()) {
            me.addHoverVectorLayerInteraction();
        }

        me.setupMapEventListeners();
        me.setCmp(cmp);

        cmp.setPointerRest(me.getPointerRest());
        cmp.setPointerRestInterval(me.getPointerRestInterval());
        cmp.setPointerRestPixelTolerance(me.getPointerRestPixelTolerance());

        if (me.getHoverable()) {
            cmp.on('pointerrest', me.onPointerRest, me);
            cmp.on('pointerrestout', me.cleanupHoverArtifacts, me);
        }
    },

    /**
     * Adds the onClick event to the registered super events,
     * if clickable is true.
     *
     * @private
     */
    setupMapEventListeners: function () {
        var me = this;
        me.callParent();

        if (me.getClickable() && me.getClickActive()) {
            var mapComponent = me.getCmp();
            var map = mapComponent.getMap();
            map.on('click', me.onClick, me);
        }
    },

    /**
     *
     */
    addHoverVectorLayerInteraction: function () {
        var me = this;
        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();

        if (!me.getHoverVectorLayerInteraction()) {
            var interaction = new ol.interaction.Select({
                multi: me.selectMulti,
                style: me.selectStyleFunction,
                layers: [me.getHoverVectorLayer()],
                filter: me.clickable ? me.filterClickableFeatures : undefined
            });
            if (me.selectEventOrigin === 'collection') {
                var featureCollection = interaction.getFeatures();
                featureCollection.on('add', me.onFeatureClicked.bind(me));
            } else {
                interaction.on('select', me.onFeatureClicked.bind(me));
            }
            map.addInteraction(interaction);
            me.setHoverVectorLayerInteraction(interaction);
        }
    },

    /**
     * Overwrites the hover.js onFeatureClicked method to
     * a noop method, as this function does not fit into
     * the hoverClick concept with separate workflows
     * for hovering and clicking.
     *
     * @return {undefined}
     */
    onFeatureClicked: function () {
        return;
    },

    /**
     * Filters the clickable features by checking the
     * isClickable property.
     *
     * @param {ol.feature} feature the feature to check.
     * @return {Boolean} Whether the feature is clickable.
     */
    filterClickableFeatures: function (feature) {
        return feature.isClickable;
    },

    /**
     * The handler for the click event on the map.
     *
     * @param {MouseEvent.onClick} evt The onClick event
     */
    onClick: function (evt) {

        var me = this;

        if (!me.getClickActive()) {
            return;
        }

        var mapComponent = me.getCmp();
        var map = mapComponent.getMap();
        var mapView = map.getView();
        var pixel = evt.pixel;
        var hoverFeaturesRevertProp = me.self.LAYER_HOVER_FEATURES_REVERT_NAME;
        var clickableProp = me.self.LAYER_CLICKABLE_PROPERTY_NAME;
        var hoverLayers = [];
        var hoverFeatures = [];

        me.cleanupHoverArtifacts();

        map.forEachLayerAtPixel(pixel, function(layer, pixelValues) {
            if (!layer.get(clickableProp)) {
                return;
            }

            var source = layer.getSource();
            var resolution = mapView.getResolution();
            var projCode = mapView.getProjection().getCode();
            var hoverFeaturesRevert = layer.get(hoverFeaturesRevertProp);


            if (source instanceof ol.source.TileWMS
                    || source instanceof ol.source.ImageWMS) {

                var url = source.getFeatureInfoUrl(
                    evt.coordinate,
                    resolution,
                    projCode,
                    {
                        'INFO_FORMAT': 'application/json',
                        'FEATURE_COUNT': me.getFeatureInfoCount()
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
                    if (hoverFeaturesRevert) {
                        hoverFeatures.reverse();
                    }

                    hoverLayers.push(layer);
                    mapComponent.fireEvent('hoverfeaturesclick', hoverFeatures);
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
                    if (!Ext.Array.contains(hoverLayers, layer)) {
                        hoverLayers.push(layer);
                    }
                    if (feat.get('layer') === layer) {
                        var clone = feat.clone();
                        clone.setId(feat.getId());

                        var hoverFeaturesIds = Ext.Array.map(hoverFeatures,
                            function(hoverFeat) {
                                return hoverFeat.getId();
                            });
                        if (!Ext.Array.contains(hoverFeaturesIds,
                            feat.getId())) {
                            var style = me.highlightStyleFunction(
                                clone, resolution, pixel);
                            clone.setStyle(style);
                            hoverFeatures.push(clone);
                        }
                    }
                    me.showHoverFeature(layer, hoverFeatures);
                    me.currentHoverTarget = feat;
                    mapComponent.fireEvent('hoverfeaturesclick', hoverFeatures);
                }, {
                    layerFilter: function(vectorCand) {
                        return vectorCand === layer;
                    }
                });
            }
        }, {
            layerFilter: me.clickLayerFilter.bind(me)
        });
    },

    /**
     * @param {ol.layer.Base} candidate The layer to check.
     * @return {Boolean} Whether the passed layer should be clickable.
     */
    clickLayerFilter: function (candidate) {
        var me = this;
        var clickableProp = me.self.LAYER_CLICKABLE_PROPERTY_NAME;

        if (candidate.get(clickableProp) ||
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
        var clickableProp = me.self.LAYER_CLICKABLE_PROPERTY_NAME;
        var clickable = layer.get(clickableProp);

        if (projection) {
            proj = projection;
        }
        var source = me.getHoverVectorLayerSource();
        Ext.each(features, function(feat) {
            feat.isClickable = clickable;
            var g = feat.getGeometry();
            if (g) {
                g.transform(proj, map.getView().getProjection());
            }
            if (!Ext.Array.contains(source.getFeatures(),
                feat)) {
                source.addFeature(feat);
            }
        });
    }

});
