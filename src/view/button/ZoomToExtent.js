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
 * The `ZoomToExtent` Button
 *
 * Button used to zoom to an extent (currently defined by a `center` and either
 * a `zoom` or a `resolution`).
 *
 * TODO This class should probably also accept an extent to configure it, that
 *      most likely be what most users will expect.
 *
 * TODO This class will need some updates when we upgrade to OpenLayers >= 4.
 *
 * @class BasiGX.view.button.ZoomToExtent
 */
Ext.define('BasiGX.view.button.ZoomToExtent', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-zoomtoextent',

    requires: [
        'BasiGX.util.Application',
        'BasiGX.util.Map',
        'Ext.app.ViewModel'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Auf Gesamtansicht zoomen',
            text: null,
            documentation: '<h2>Auf Gesamtansicht zoomen</h2>• Ein Klick auf ' +
                'den Button zoomt die Karte auf die Gesamtansicht.'
        }
    },

    /**
     * A config object to show this tool in action (live demo) when using the
     * context sensitive help
     */
    liveDemoConfig: [
        {
            moveMouseTo: 'basigx-button-zoomtoextent'
        },
        {
            clickOnButton: 'basigx-button-zoomtoextent'
        }
    ],

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * The OpenLayers map this button is bound to. If not passed when
     * instantiating, a map will be guessed.
     */
    olMap: null,

    /**
     * This can be configured with `center` and either `zoom` or `resolution`
     * (if both are passed `zoom` will win). If you want to zoom to an extent
     * passing only the option `extent` will work. The options `center`, `zoom`
     * and `resolution` will be ignored in this case.
     * Rotation can be passed in all cases.
     */
    config: {
        center: null,
        zoom: null,
        resolution: null,
        rotation: null,
        extent: null,
        handler: function() {
            var me = this;
            me.setConfigValues();

            var olMap = me.olMap;

            // fallback
            if (Ext.isEmpty(olMap)) {
                olMap = BasiGX.util.Map.getMapComponent().getMap();
            }

            var olView = olMap.getView();

            var targetCenter = me.getCenter();
            var targetResolution = me.getResolution();
            var targetRotation = me.getRotation();
            var targetZoom = me.getZoom();
            var targetExtent = me.getExtent();

            if (targetExtent && olView.getResolutionForExtent) {
                targetResolution = olView.getResolutionForExtent(targetExtent);
                targetCenter = ol.extent.getCenter(targetExtent);
                // reset zoom, so the calculated resolution gets considered
                targetZoom = null;
            }

            // This if is need for backwards comaptibility to ol
            if (ol.animation) {
                // Create the animation with their respective start values:
                var pan = ol.animation.pan({
                    source: olView.getCenter()
                });
                var zoom = ol.animation.zoom({
                    resolution: olView.getResolution()
                });
                var rotate = ol.animation.rotate({
                    rotation: olView.getRotation()
                });
                // before we actually render, animate to the new values using
                // the methods defined above
                olMap.beforeRender(pan, zoom, rotate);

                // Next: trigger a view change by setting `center`, `rotation`
                // and either `zoom` (tried first) or `resolution`. The
                // animation methods will transition smoothly.
                olView.setCenter(targetCenter);
                olView.setRotation(targetRotation);
                if (targetZoom) {
                    olView.setZoom(targetZoom);
                } else {
                    olView.setResolution(targetResolution);
                }
            } else {
                var animationObj = {
                    center: targetCenter,
                    rotation: targetRotation
                };
                if (targetZoom) {
                    animationObj.zoom = targetZoom;
                } else {
                    animationObj.resolution = targetResolution;
                }
                olView.animate(animationObj);
            }
        }
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf0b2@FontAwesome',
    html: '<i class="fa fa-arrows-alt fa-2x"></i>',

    /**
     *
     */
    constructor: function() {
        var me = this;
        me.callParent(arguments);

        if (me.getZoom() !== null && me.getResolution() !== null) {
            Ext.raise(
                'Both zoom and resolution set for ZoomToExtent button. ' +
                'Please choose one.'
            );
        }

        me.setConfigValues();
    },

    /**
     * This method will be called on initialisation and whenever a click/tap
     * on the button happens. If we were not configured with explicit values
     * for `center`, `rotation` and either `zoom` or `resolution`, we will try
     * read out matching values from the application context.
     */
    setConfigValues: function() {
        var me = this;
        var appContext = BasiGX.util.Application.getAppContext();

        if (appContext) {
            if (!me.getCenter()) {
                me.setCenter(appContext.startCenter);
            }
            if (me.getRotation() === null) { // 0 is a valid rotation…
                me.setRotation(appContext.startRotation || 0);
            }
            if (!me.getZoom() && !me.getResolution()) {
                me.setZoom(appContext.startZoom);
            }
        }
    }
});
