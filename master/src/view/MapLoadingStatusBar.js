/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * A progressbar that indicates loading of map resources such as tile of layers.
 *
 * This will work with sources that inherit from `ol.source.Image` or
 * `ol.source.Tile` directly. This includes e.g.:
 *
 * * `ol.source.ImageWMS`,
 * * `ol.source.ImageArcGISRest`,
 * * `ol.source.ImageCanvas`,
 * * `ol.source.ImageMapGuide`,
 * * `ol.source.ImageStatic`,
 * * `ol.source.ImageWMS`,
 * * `ol.source.Raster`,
 * * `ol.source.BingMaps`,
 * * `ol.source.TileArcGISRest`,
 * * `ol.source.TileJSON`,
 * * `ol.source.TileWMS`,
 * * `ol.source.WMTS`,
 * * `ol.source.XYZ`,
 * * `ol.source.Zoomify`,
 * * `ol.source.CartoDB`,
 * * `ol.source.OSM`,
 * * `ol.source.Stamen`,
 * * `ol.source.VectorTile`
 *
 * If your `ol.source.Vector` fires all the custom events `vectorloadstart`,
 * `vectorloadend` and `vectorloaderror` -- e.g. by using a custom loader
 * function -- these source will also participate when this component determines
 * the loading state of the application. This will also work for vector sources
 * that are clustered.
 *
 * @class BasiGX.view.MapLoadingStatusBar
 */
Ext.define('BasiGX.view.MapLoadingStatusBar', {
    extend: 'Ext.ProgressBar',
    xtype: 'basigx-maploadingstatusbar',

    requires: [
        'BasiGX.util.Map'
    ],

    config: {
        /**
         * The Map for which this progressbar shows the loading status. If not
         * passed, we'll guess.
         *
         * @type {ol.Map}
         */
        map: null,

        /**
         * A configuration to be passed to the `wait` method, see the API
         * method. A text here will override a `loadingText` entry of a
         * `viewModel`.
         *
         * @type {Object}
         */
        waitConf: {
            interval: 200,
            increment: 15
        }
    },

    viewModel: {
        data: {
            /**
             * The text to show when loading is happening. Can be overriden with
             * the `waitConf` configuration option.
             *
             * @type {String}
             */
            loadingText: 'Loading…'
        }
    },

    /**
     * The number of currently loading 'things' (tiles, XHR …)
     *
     * @private
     * @type {Number}
     */
    loading: 0,

    /**
     * The constructor of the ProgressBar.
     */
    initComponent: function() {
        var me = this;
        if (!me.getMap()) {
            me.setMap(BasiGX.util.Map.getMapComponent().getMap());
        }
        me.hide();
        me.callParent();
    },

    /**
     * Called when the `map` is set, this will unbind from the current map, if
     * needed, and bind to the newly passed map.
     *
     * @param {ol.Map} newMap The new map, if any.
     * @param {ol.Map} oldMap The old map, if any.
     * @return {ol.Map} The new map.
     */
    applyMap: function(newMap, oldMap) {
        var me = this;
        if (oldMap) {
            me.registerUnregisterListeners(false, oldMap);
        }
        if (newMap) {
            me.registerUnregisterListeners(true, newMap);
        }
        return newMap;
    },

    /**
     * Registers or unregisters needed events for the layers in the passed map.
     *
     * @param {Boolean} register `true` to register, `false` to unregister.
     * @param {ol.Map} map The map to register/unregister on.
     */
    registerUnregisterListeners: function(register, map) {
        if (!(map instanceof ol.Map)) {
            return;
        }
        var group = map.getLayerGroup();
        this.registerUnregisterLayerListeners(register, group);
    },

    /**
     * Registers or unregisters needed events for the passed layer, takes care
     * of group layers by calling itself recursively.
     *
     * @param {Boolean} register `true` to register, `false` to unregister.
     * @param {ol.layer.Layer} layer The layer to register/unregister on.
     */
    registerUnregisterLayerListeners: function(register, layer) {
        var me = this;
        var method = register ? 'on' : 'un';
        if (layer instanceof ol.layer.Group) {
            // call ourself recursively
            var layers = layer.getLayers();
            layers.forEach(function(child) {
                me.registerUnregisterLayerListeners(register, child);
            });
            // handle future changes to this group, or stop doing so
            layers[method]('add', me.onLayerAddedToGroup, me);
            layers[method]('remove', me.onLayerRemovedFromGroup, me);
        } else {
            var source = layer.getSource();
            // bind or unbind our handlers
            me.bindOrUnbindLoadHandlers(register, source);
        }
    },

    /**
     * Registers or unregisters needed events for the passed source, takes care
     * of source which do not naturally support load events (`vector`-sources).
     *
     * @param {Boolean} bind `true` to register, `false` to unregister.
     * @param {ol.source.Source} source The source to register/unregister on.
     */
    bindOrUnbindLoadHandlers: function(bind, source) {
        var me = this;
        var method = bind ? 'on' : 'un';
        var eventPrefix = '';
        if (source instanceof ol.source.Image) {
            // includes ImageWms, but also e.g. ImageArcGISRest, OSM…
            eventPrefix = 'image';
        } else if (source instanceof ol.source.Tile) {
            // includes TileWMS, Bingmaps and more
            eventPrefix = 'tile';
        } else if (source instanceof ol.source.Vector) {
            if (source instanceof ol.source.Cluster) {
                source = source.getSource(); // we fire on the raw source
            }
            eventPrefix = 'vector';
        }

        if (eventPrefix) {
            source[method](eventPrefix + 'loadstart', me.incrementAndCheck, me);
            source[method](eventPrefix + 'loadend', me.decrementAndCheck, me);
            source[method](eventPrefix + 'loaderror', me.decrementAndCheck, me);
        }
    },

    /**
     * Called whenever loading starts, this will increment the internal counter
     * and also start the progress-updating mechanism.
     */
    incrementAndCheck: function() {
        var me = this;
        me.loading++;
        if (!me.isVisible()) {
            me.show();
        }
        if (me.isWaiting()) {
            return;
        }
        if (me.loading > 0) {
            var waitConf = me.getWaitConf();
            if (!waitConf.text) {
                waitConf.text = me.lookupViewModel().get('loadingText');
            }
            if (waitConf.duration) {
                // when we have a duration set, we need to make sure that when
                // the duration is exceeded, we internally reset our loading
                // counter. Since the user can also set a custom function to
                // execute, we have to handle this case as well.

                // 1. Our handler when duration is reached.
                var resetLoading = Ext.Function.bind(me.resetLoading, me);
                if (waitConf.fn && Ext.isFunction(waitConf.fn)) {
                    // 2. The user has set a handler when duration is reached
                    //    We create a function that will first call the user
                    //    function, then ours
                    resetLoading = Ext.Function.createSequence(
                        waitConf.fn,
                        resetLoading,
                        waitConf.scope
                    );
                }
                // 3. Set the newly created function (probably a combination of
                //    a user and the internal function)
                waitConf.fn = resetLoading;
                // 4. Unset any possibly set scope from user, the createSequence
                //    from above took care of that already.
                delete waitConf.scope;
            }
            me.wait(waitConf);
        }
    },

    /**
     * Called whenever loading stops or errors, this will decrement the internal
     * and if nothing is currently loading, it will stop the progress-updating
     * mechanism, reset the counter and hide the progressbar.
     */
    decrementAndCheck: function() {
        var me = this;
        me.loading--;
        if (me.loading <= 0) {
            me.reset(true);
            me.resetLoading(); // sanity
        }
    },

    /**
     * Helper method to reset the internal loading counter.
     */
    resetLoading: function() {
        this.loading = 0;
    },

    /**
     * Takes care of added layers to any `ol.layer.Group`, these need to get the
     * appropriate handlers assigned.
     *
     * @param {ol.event.Event} evt The add event of the `ol.layer.Group`.
     */
    onLayerAddedToGroup: function(evt) {
        this.registerUnregisterLayerListeners(true, evt.element);
    },

    /**
     * Takes care of removed layers to any `ol.layer.Group`, these need to get
     * appropriate handlers removed.
     *
     * @param {ol.event.Event} evt The remove event of the `ol.layer.Group`.
     */
    onLayerRemovedFromGroup: function(evt) {
        this.registerUnregisterLayerListeners(false, evt.element);
    },

    /**
     * Unbind any registered handlers of the current map before continuing
     * destroying this component.
     */
    doDestroy: function() {
        var me = this;
        me.registerUnregisterListeners(false, me.getMap());
        me.callParent();
    }

});
