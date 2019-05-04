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
 * ZoomOut Button
 *
 * Button used to zoom out.
 *
 * @class BasiGX.view.button.ZoomOut
 */
Ext.define('BasiGX.view.button.ZoomOut', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-zoomout',
    requires: [
        'Ext.app.ViewModel',
        'BasiGX.util.Map'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Herauszoomen',
            text: null,
            documentation: '<h2>Herauszoomen</h2>' +
                '• Ein Klick auf den Button aktiviert ZoomOut-Modus:<br>' +
                '• Ein Klick in die Karte verkleinert sie um eine Zoomstufe.' +
                '<br>' +
                '• Wird ein Rechteck über die Karte gezogen, zoomt die Karte ' +
                'zum gewählten Ausschnitt (Button muss mit der Option ' +
                '`enableZoomOutWithBox=true` konfiguriert sein).'

        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * The ol map this button is bound to
     */
    olMap: null,

    /**
     * ZoomOut button is not toggleable per default and behaves like simple
     * button. If #toggleGroup or #enableToggle is set by instantiation the
     * `click` handler will be ignored and `toggle` handler will be used
     * instead.
     */
    toggleGroup: null,

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf010@FontAwesome',
    html: '<i class="fa fa-search-minus fa-2x"></i>',

    /**
     * A config object to show this tool in action (live demo) when using the
     * context sensitive help
     */
    liveDemoConfig: [
        {
            moveMouseTo: 'basigx-button-zoomout'
        },
        {
            clickOnButton: 'basigx-button-zoomout'
        }
    ],

    config: {
        /**
         * When set to true zoom out by clicking and dragging on the map is
         * enabled. Only applicable if instantiated as toggle button.
         * Default is false.
         */
        enableZoomOutWithBox: false,
        /**
         * Whether zoom action should be animated or not. Default is true.
         */
        animate: true,
        /**
         * Reference to ol DragZoom interaction which will be used if
         * #enableZoomOutWithBox is set to true.
         */
        dragZoomOutInteraction: null,
        /**
         * Default zoom animation duration in milliseconds. Only applicable if
         * #animate is set to true.
         */
        animationDuration: 500
    },

    listeners: {
        afterrender: function() {
            var me = this;
            if (Ext.isEmpty(me.olMap)) {
                me.olMap = BasiGX.util.Map.getMapComponent().getMap();
            }
        },
        click: function() {
            var me = this;
            // do nothing if configured as toggle button
            if (me.enableToggle) {
                return;
            }
            me.zoomOut();
        },
        toggle: function(btn, pressed) {
            var me = this;
            if (me.enableZoomOutWithBox) {
                if (!me.dragZoomOutInteraction) {
                    me.dragZoomOutInteraction = new ol.interaction.DragZoom({
                        condition: ol.events.condition.always,
                        duration: me.animationDuration,
                        out: true
                    });
                    me.olMap.addInteraction(me.dragZoomOutInteraction);
                }
            }
            if (pressed) {
                me.olMap.on('click', me.zoomOut, me);
                if (me.enableZoomOutWithBox) {
                    me.dragZoomOutInteraction.setActive(true);
                }
            } else {
                me.olMap.un('click', me.zoomOut, me);
                if (me.enableZoomOutWithBox) {
                    me.dragZoomOutInteraction.setActive(false);
                }
            }
        }
    },

    /**
     * Callback function of `click` event on the map while zoomOut button is
     * toggled.
     */
    zoomOut: function() {
        var me = this;
        var zoom;
        var olView = me.olMap.getView();

        // This if is need for backwards compatibility to ol
        if (me.animate) {
            if (ol.animation) {
                zoom = ol.animation.zoom({
                    resolution: olView.getResolution(),
                    duration: 500
                });
                me.olMap.beforeRender(zoom);
                olView.setResolution(olView.getResolution() * 2);
            } else {
                olView.animate({
                    resolution: olView.getResolution() * 2,
                    duration: 500
                });
            }
        } else {
            olView.setResolution(olView.getResolution() * 2);
        }
    }
});
