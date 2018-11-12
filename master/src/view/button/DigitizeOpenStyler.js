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
 * Digitize Open Styler Button
 *
 * @class BasiGX.view.button.DigitizeOpenStyler
 */
Ext.define('BasiGX.view.button.DigitizeOpenStyler', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-digitize-open-styler',

    requires: [
        'BasiGX.view.container.RedlineStyler'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Opens the styler window',
            openStyleBtnText: 'Styler',
            stylerWindowTitle: 'Styler'
        }
    },

    /**
     *
     */
    bind: {
        text: '{openStyleBtnText}'
    },

    config: {
        /**
         *
         */
        stylerWindow: null,

        /**
         *
         */
        redliningVectorLayer: null,

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

        redlinePointStyle: null,

        redlinePolygonStyle: null,

        redlineLineStringStyle: null

    },

    name: 'openStyleBtn',
    toggleGroup: 'draw',

    listeners: {
        toggle: function(btn, pressed) {
            var me = this;
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
                            redliningVectorLayer: me.getRedliningVectorLayer(),
                            backendUrls: me.getBackendUrls(),
                            redlinePointStyle: me.getRedlinePointStyle(),
                            redlineLineStringStyle:
                                me.getRedlineLineStringStyle(),
                            redlinePolygonStyle: me.getRedlinePolygonStyle()
                        })
                });
                me.stylerWindow.on('close', function() {
                    me.fireFeatureChanged();
                    btn.toggle();
                });
            }
            if (pressed) {
                me.stylerWindow.show();
            } else {
                me.stylerWindow.hide();
            }
        }
    },

    /**
     * Fire a change event to inform other components
     */
    fireFeatureChanged: function() {
        this.fireEvent('featurechanged');
    }
});
