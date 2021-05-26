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
 * HSI Button
 *
 * Button used to query for information.
 *
 * @class BasiGX.view.button.Hsi
 */
Ext.define('BasiGX.view.button.Hsi', {
    extend: 'BasiGX.view.button.Base',
    xtype: 'basigx-button-hsi',
    requires: [
        'Ext.app.ViewModel',
        'BasiGX.util.Map'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            tooltip: 'Informationsabfrage',
            text: null,
            documentation: '<h2>Informationsabfrage</h2>• Ein Klick auf den ' +
                'Button aktiviert bzw. deaktiviert die Informationsabfrage ' +
                'in der Karte.<br>• Wenn Sie sich bei aktiviertem Werkzeug ' +
                'mit der Maus über ein abfragbares Kartenthema befinden, ' +
                'wird die Information zu diesem Objekt in einem Fenster ' +
                'dargestellt'
        }
    },

    /**
     *
     */
    bind: {
        text: '{text}'
    },

    /**
     * The icons the button should use.
     * Classic Toolkit uses glyphs, modern toolkit uses html
     */
    glyph: 'xf05a@FontAwesome',
    html: '<i class="fa fa-info-circle fa-2x"></i>',

    /**
     *
     */
    enableToggle: true,

    /**
     *
     */
    buttonPressed: true,

    /**
     *
     */
    config: {
        /**
         * Placeholder for the xtype of the map component (e.g.
         * 'basigx-component-map'). Will be used to be able to determine the map
         * component dynamically
         */
        mapPanelXType: null,
        handler: function() {
            this.buttonPressed = !this.buttonPressed;
            this.toggleButton();
        }
    },

    /**
     *
     */
    constructor: function() {
        this.callParent(arguments);
        this.toggleButton();
    },

    /**
     *
     */
    toggleButton: function() {
        if (this.setPressed) {
            this.setPressed(this.buttonPressed);
        } else {
            this.setCls(this.buttonPressed ? this.getPressedCls() :
                'basigx-map-tool-button');
        }
        this.setControlStatus(this.buttonPressed);
    },

    /**
     * Activates or deactivates the `pointerrest`-event depending on the passed
     * status and prevents click events trigger if control was untoggled.
     *
     * TODO we should get rid of the guessing, or at least make it optional.
     *
     * @param {Boolean} status Whether to enable or disable the `pointerrest`
     *     event.
     */
    setControlStatus: function(status) {
        var me = this;
        var mapComponent;

        mapComponent = BasiGX.util.Map.getMapComponent(me.getMapPanelXType());
        mapComponent.setPointerRest(status);

        var plugins = mapComponent.getPlugins();
        Ext.each(plugins, function(plugin) {
            if (plugin instanceof BasiGX.plugin.HoverClick) {
                plugin.setClickActive(status);
            }
        });
    }
});
