/* Copyright (c) 2016-present terrestris GmbH & Co. KG
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
 *  A grid showing results of the gazetteer search response values.
 *
 * @class BasiGX.view.grid.GazetteerGrid
 */
Ext.define('BasiGX.view.grid.GazetteerGrid', {
    extend: 'Ext.grid.Panel',

    xtype: 'basigx_grid_gazetteergrid',

    requires: [
        'BasiGX.store.GazetteerSearch',
        'BasiGX.util.Map',
        'BasiGX.util.Layer',
        'BasiGX.util.Animate'
    ],

    store: {
        type: 'basigx-gazetteersearch'
    },

    viewModel: {
        data: {
            title: 'Gazetteer',
            hideToolTooltip: 'Gazetteer verbergen',
            limitCboxLabel: 'Auf den sichtbaren Kartenbereich einschränken',
            refreshBtnTooltip: 'Aktualisieren',
            directionBtnTooltip: 'Hinweise zu Gazetteer',
            gazetteerHtmlHints: 'Führen Sie die Maus über die ' +
                'Suchergebnisse, um diese auf der Karte zu markieren.<br/>' +
                'Klicken Sie auf ein Element, um die Karte darauf zu ' +
                'zentrieren.<br/>' +
                'Beachten Sie, dass einige Suchergebnisse außerhalb des ' +
                'sichtbaren Kartenbereichs liegen können, falls die ' +
                'Option "Auf den sichtbaren Kartenbereich einschränken" ' +
                'abgewählt ist.'
        }
    },

    bind: {
        title: '{title}'
    },

    tools: [{
        type: 'minimize',
        bind: {
            tooltip: '{hideToolTooltip}'
        },
        handler: function(e, target, gridheader) {
            var grid = gridheader.up('grid');
            grid.getEl().slideOut('t', {
                duration: 250,
                callback: function() {
                    grid.hide();
                }
            });
        }
    }],

    width: 500,

    maxHeight: 400,

    hidden: true,

    tbar: [{
        xtype: 'checkbox',
        name: 'limitcheckbox',
        checked: true,
        bind: {
            boxLabel: '{limitCboxLabel}'
        }
    },
    {
        xtype: 'button',
        name: 'refreshsearchbutton',
        bind: {
            tooltip: '{refreshBtnTooltip}'
        },
        iconCls: 'fa fa-refresh fa-2x'
    },
    '->',
    {
        xtype: 'button',
        name: 'directionsbutton',
        bind: {
            tooltip: '{directionBtnTooltip}'
        },
        iconCls: 'fa fa-question fa-2x'
    }
    ],

    style: {
        right: '75px',
        top: '10px'
    },

    config: {
        layer: null,

        map: null
    },

    columns: {
        items: [{
            text: '',
            xtype: 'templatecolumn',
            width: 40,
            tpl: '<img src="{icon}" height="16" width="16">'
        }, {
            text: 'Name',
            xtype: 'templatecolumn',
            tpl: '<div data-qtip="{display_name}">' +
                        '{display_name}' +
                '</div>',
            flex: 2
        }, {
            text: 'Class',
            dataIndex: 'class',
            flex: 1
        }, {
            text: 'Type',
            dataIndex: 'type',
            flex: 1
        }]
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        // set handler for all grid items
        me.down('checkbox[name=limitcheckbox]')
            .on('change', me.refreshSearchResults, me);
        me.down('button[name=refreshsearchbutton]')
            .setHandler(me.refreshSearchResults, me);
        me.down('button[name=directionsbutton]')
            .setHandler(me.showDirections, me);

        // add listeners
        me.on('boxready', me.onBoxReady, me);
        me.on('itemmouseenter', me.onItemMouseEnter, me);
        me.on('itemmouseleave', me.onItemMouseLeave, me);
        me.on('itemclick', me.onItemClick, me);

        // unregister listeners on grid hide
        me.on('hide', me.unregisterListeners, me);
    },

    /**
     *
     */
    onBoxReady: function() {
        var me = this;
        if (!me.getMap()) {
            var map = BasiGX.util.Map.getMapComponent().getMap();
            me.setMap(map);
        }
        if (!me.getLayer()) {
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            layer.set(displayInLayerSwitcherKey, false);
            me.setLayer(layer);
            me.getMap().addLayer(layer);
        }
    },

    /**
     * Highlights the associated feature when the mouse hover over a grid row.
     *
     * @param {Ext.grid.Panel} grid The grid panel.
     * @param {Ext.data.Model} record The record that belongs to the item.
     */
    onItemMouseEnter: function(grid, record) {
        var me = this;
        var layer = me.getLayer();
        var projection = me.getMap().getView().getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('geotext');
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        layer.getSource().addFeature(feature);
    },

    /**
     * Unhighlights the associated feature when the mouse hover out of the grid
     * row.
     */
    onItemMouseLeave: function() {
        var me = this;
        var layer = me.getLayer();
        layer.getSource().clear();
    },

    /**
     * Recenters the map on the associated feature when the mouse clicks on a
     * grid row.
     *
     * @param {Ext.grid.Panel} grid The grid panel.
     * @param {Ext.data.Model} record The record that belongs to the item.
     */
    onItemClick: function(grid, record) {
        var me = this;
        var map = me.getMap();
        var olView = map.getView();
        var projection = olView.getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('geotext');
        var feature = format.readFeature(wkt);
        var geom = feature.getGeometry().transform('EPSG:4326', projection);

        // This if is need for backwards comaptibility to ol
        if (ol.animation) {
            olView.fit(geom, map.getSize());
        } else {
            olView.fit(geom, {
                duration: 500
            });
        }
    },

    /**
     * Refreshes the search result by calling into `doGazetteerSearch` of the
     * `basigx_form_field_gazetteercombo`.
     */
    refreshSearchResults: function() {
        var gazetteerCombo =
            Ext.ComponentQuery.query('basigx_form_field_gazetteercombo')[0];
        var value = gazetteerCombo.getValue();
        gazetteerCombo.doGazetteerSearch(value);
    },

    /**
     * Opens a window with directions about how to use the gazetteer grid.
     */
    showDirections: function() {
        var win = Ext.ComponentQuery.query(
            'window[name="gazetteerdirections"]')[0];
        if (win) {
            if (win.isVisible()) {
                BasiGX.util.Animate.shake(win);
            } else {
                win.show();
            }
        } else {
            Ext.create('Ext.window.Window', {
                title: this.getViewModel().get('title'),
                name: 'gazetteerdirections',
                height: 200,
                width: 400,
                layout: 'fit',
                bodyPadding: 5,
                constrain: true,
                html: this.getViewModel().get('gazetteerHtmlHints')
            }).show();
        }
    },

    /**
     * When we are hidden, this method unregisters listeners for the various
     * interactions with the grid.
     */
    unregisterListeners: function() {
        var me = this;
        me.un('boxready', me.onBoxReady, me);
        me.un('itemmouseenter', me.onItemMouseEnter, me);
        me.un('itemmouseleave', me.onItemMouseLeave, me);
        me.un('itemclick', me.onItemClick, me);
    },

    /**
     * TODO is this method still used?
     */
    onGazetteerGridSlideOut: function() {
        this.hide();
    }
});
