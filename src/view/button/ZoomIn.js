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
 * ZoomIn Button
 *
 * Button used to zoom in
 *
 * @class BasiGX.view.button.ZoomIn
 */
Ext.define('BasiGX.view.button.ZoomIn', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-zoomin',
    requires: [
        'Ext.app.ViewModel',
        'BasiGX.util.Map'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Hineinzoomen',
            text: null,
            documentation: '<h2>Hineinzoomen</h2>• Ein Klick auf den Button ' +
                'vergrößert die Karte um eine Zoomstufe.'
        }
    },

    bind: {
        text: '{text}'
    },

    /**
     * The ol map this button is bounded to
     */
    olMap: null,

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf00e@FontAwesome',
    html: '<i class="fa fa-search-plus fa-2x"></i>',

    /**
     * A config object to show this tool in action (live demo) when using the
     * context sensitive help
     */
    liveDemoConfig: [
        {
            moveMouseTo: 'basigx-button-zoomin'
        },
        {
            clickOnButton: 'basigx-button-zoomin'
        }
    ],

    /**
     *
     */
    config: {
        handler: function() {
            var me = this;
            var olMap = me.olMap;
            var olView;
            var zoom;

            //fallback
            if (Ext.isEmpty(olMap)) {
                olMap = BasiGX.util.Map.getMapComponent().getMap();
            }

            olView = olMap.getView();

            // This if is need for backwards comaptibility to ol
            if (ol.animation) {
                zoom = ol.animation.zoom({
                    resolution: olView.getResolution(),
                    duration: 500
                });
                olMap.beforeRender(zoom);
                olView.setResolution(olView.getResolution() / 2);
            } else {
                olView.animate({
                    resolution: olView.getResolution() / 2,
                    duration: 500
                });
            }
        }
    }
});
