/* Copyright (c) 2017-present terrestris GmbH & Co. KG
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
 *
 * BasiGX.view.panel.FontSymbolPool
 *
 * Used to display the available fonts and their symbols available in
 * the geoserver. Enables user to select a symbol for e.g. SLD styling
 *
 * @class BasiGX.view.panel.FontSymbolPool
 */
Ext.define('BasiGX.view.panel.FontSymbolPool', {
    extend: 'Ext.panel.Panel',
    xtype: 'basigx-panel-fontsymbolpool',

    requires: [
        'BasiGX.util.Url',
        'BasiGX.util.CSRF',
        'BasiGX.util.MsgBox',
        'BasiGX.view.panel.TtfGlyphInspector'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            closeBtnText: 'Close',
            fontSelectLabel: 'Select a font'
        }
    },

    /**
     * global padding
     */
    padding: 5,

    /**
     * a default width for this component
     */
    width: 535,

    /**
     * a default height for this component
     */
    height: 600,

    /**
     * the layout to use
     */
    layout: 'vbox',

    /**
     *
     */
    config: {
        /**
         * The REST URL of the GeoServer to retrieve all available fonts.
         * E.g. http://localhost:8080/geoserver/rest/resource/fonts
         * would list all fonts from the GEOSERVER_DATA_DIR/fonts directory
         */
        geoserverFontListUrl: null,

        /**
         * The REST URL of the GeoServer to retrieve a specific font. E.g.
         * http://localhost:8080/geoserver/rest/resource/fonts/Arial.ttf
         * would retrieve the specific font from the
         * GEOSERVER_DATA_DIR/fonts directory
         */
        geoserverFontUrl: null,

        /**
         * flag that indicates that a csrf-token should be sent to backend
         * interfaces on every ajax / form submit.
         */
        useCsrfToken: false,

        /**
         * function that should be called when a glyph has been selected
         */
        onGlyphSelected: null,

        /**
         * should we offer a close button? Will close a parent window if
         * one exists
         */
        useCloseButton: true,

        /**
         * The current ttf font object url to use as blob converted Uint8Array
         */
        fontBlobUrl: null,

        /**
         * The name of the currently selected font
         */
        selectedFontName: null
    },

    /**
     *
     */
    initComponent: function() {
        var me = this;

        // retrieve the available fonts from GeoServer via REST
        var store = Ext.create('Ext.data.Store', {
            sorters: 'fontName',
            fields: [
                'name'
            ],
            proxy: {
                type: 'ajax',
                url: me.getGeoserverFontListUrl(),
                reader: {
                    type: 'json',
                    rootProperty: 'ResourceDirectory.children.child'
                }
            }
        });
        store.load();

        me.items = [{
            xtype: 'combo',
            width: 400,
            store: store,
            bind: {
                fieldLabel: '{fontSelectLabel}'
            },
            displayField: 'name',
            queryMode: 'local',
            listeners: {
                change: me.fontSelected
            }
        }];

        me.bbar = [
            '->',
            {
                bind: {
                    text: '{closeBtnText}'
                },
                scope: me,
                handler: me.onCloseButtonClick,
                hidden: !me.getUseCloseButton()
            }
        ];

        me.callParent();
    },

    /**
     * Method retrieves a TrueTypeFont in binary mode from the GeoServer
     * in order to render its glyphs on the client side.
     *
     * @param {Object} combo The combobox that fired the event.
     * @param {String} fontName The name of the font that has been selected.
     */
    fontSelected: function(combo, fontName) {
        var symbolPool = this.up('basigx-panel-fontsymbolpool');
        var selectedRecord = combo.getSelectedRecord();
        var ttfHref = selectedRecord.getData().link.href;
        symbolPool.setSelectedFontName(fontName);

        if (ttfHref) {
            Ext.Ajax.request({
                binary: true,
                url: symbolPool.getGeoserverFontUrl(),
                method: 'GET',
                params: {
                    fontName: fontName
                },
                defaultHeaders: BasiGX.util.CSRF.getHeader(),
                scope: this,
                success: function(response) {
                    var blob = new Blob(
                        [response.responseBytes],
                        {type: 'application/octet-stream'}
                    );
                    var url = window.URL.createObjectURL(blob);
                    symbolPool.setFontBlobUrl(url);
                    symbolPool.renderSymbols();
                },
                failure: function() {
                    Ext.toast('Error retrieving the Graphic preview');
                }
            });
        }
    },

    /**
     * Method renders the available glyphs of a TrueTypeFont by instantiating
     * 'BasiGX.view.panel.TtfGlyphInspector' with the font-blob. If a glyph
     * has been clicked by the user, the given callBack function will be called.
     */
    renderSymbols: function() {
        var me = this;
        // cleanup
        var panels = me.query('basigx-panel-ttfglyphinspector');
        Ext.each(panels, function(panel) {
            panel.destroy();
        });
        var glyphPanel = Ext.create('BasiGX.view.panel.TtfGlyphInspector', {
            fontSrc: this.getFontBlobUrl()
        });
        this.add(glyphPanel);
        glyphPanel.on('glyphSelected', function(fullQualifiedGlyphName) {
            me.getOnGlyphSelected().call(me, fullQualifiedGlyphName);
        });
    },

    /**
     * Method closes the window where this panel is embedded, if any.
     */
    onCloseButtonClick: function() {
        var me = this;
        if (me.up('window')) {
            me.up('window').close();
        }
    }
});
