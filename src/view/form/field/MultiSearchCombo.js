/* Copyright (c) 2016 terrestris GmbH & Co. KG
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
 * Multisearch combo used to search in the glorious dataset of OSM combined
 * with a WFS search searching through configurable layers. This class calls
 * BasiGX.view.container.MultiSearchSettings to configure settings and
 * BasiGX.view.grid.MultiSearchWFSSearchGrid as well as
 * BasiGX.view.grid.MultiSearchGazetteerGrid to show search results.
 *
 * Example usage:
 *
 *     {
 *         xtype: 'basigx-form-field-multisearch',
 *         config: {
 *             wfsServerUrl: "yourdomain/geoserver/ows?",
 *             searchLayerBlackList: [
 *                 "your-favorite-background-layer"
 *             ]
 *         }
 *     }
 *
 * @class BasiGX.view.form.field.MultiSearchCombo
 *
 */
Ext.define('BasiGX.view.form.field.MultiSearchCombo',{
    extend: 'Ext.form.field.ComboBox',
    xtype: 'basigx-form-field-multisearch',

    requires: [
        "BasiGX.util.Map",
        "BasiGX.view.container.MultiSearchSettings",
        "BasiGX.view.grid.MultiSearchWFSSearchGrid",
        "BasiGX.view.grid.MultiSearchGazetteerGrid"
    ],

    viewModel: {
        data: {
            emptyText: "Suche ...",
            settingsWindowTitle: "Sucheinstellungen"
        }
    },

    config: {

        gazetteerGrid: "basigx-grid-multisearchgazetteergrid",

        wfsSearchGrid: "basigx-grid-multisearchwfssearchgrid",

        searchSettings: "basigx-container-multisearchsettings",

        wfsServerUrl: null,

        wfsPrefix: null,

        gazetteerSearch: true,

        wfsSearch: true,

        limitToBBox: true,

        allSearchLayers: [],

        configuredSearchLayers: [],

        searchLayerBlackList: []

    },

    store: [],

    searchContainer: null,

    settingsWindow: null,

    bind: {
        emptyText: '{emptyText}'
    },

    triggerCls: 'default-trigger',

    triggers: {
        refresh: {
            cls: 'multisearch-refresh-trigger',
            handler: function(){
                this.refreshSearchResults();
            }
        },
        settings: {
            cls: 'multisearch-settings-trigger',
            handler: function(){
                this.showSettingsWindow();
            }
        }
    },

    initComponent: function(){
        var me = this;

        me.callParent(arguments);

        me.setHideTrigger(false);

        // get all layers from the map except the blacklisted ones
        var map = BasiGX.util.Map.getMapComponent().getMap();
        var allLayers = BasiGX.util.Layer.getAllLayers(map);
        var blackList = me.getSearchLayerBlackList();

        Ext.each(allLayers, function(l) {
            if (l instanceof ol.layer.Tile && !Ext.Array.contains(blackList,
                    l.get('name'))) {
                me.allSearchLayers.push(l);
            }
        });

        // set search layers to all above layers if not configured different
        if (me.getConfiguredSearchLayers().length === 0 ) {
            Ext.each(me.getAllSearchLayers(), function(l) {
                me.configuredSearchLayers.push(l);
            });
        }

        me.on('boxready', me.onBoxReady, me);
        me.on('change', me.onComboValueChange, me);

    },

    onBoxReady: function(){
        var me = this;
        me.nav = Ext.create('Ext.util.KeyNav', me.el, {
            esc: me.clearValue,
            scope: me
        });
    },

    onComboValueChange: function(combo, newValue){
        var me = this;

        if(newValue){
            // create the multi search panel
            me.showResults();

            // start the gazetteer search
            me.doGazetteerSearch(newValue, me.getLimitToBBox);

            // start the object search
            me.doObjectSearch(newValue);

        } else {
            var objectSearchGrid =
                Ext.ComponentQuery.query(me.getWfsSearchGrid())[0];
            var searchLayer = objectSearchGrid.searchResultVectorLayer;

            if(searchLayer) {
                searchLayer.getSource().clear();
            }

            if(me.searchContainer) {
                me.searchContainer.getEl().slideOut('t', {
                    duration: 250,
                    callback: function() {
                        me.searchContainer.hide();
                    },
                    scope: me.searchContainer
                });
            }

        }
    },

    doGazetteerSearch: function(value, limitToBBox){

        var me = this;

        var gazetteerGrid =
            Ext.ComponentQuery.query(me.getGazetteerGrid())[0];

        if (gazetteerGrid) {
            if (me.getGazetteerSearch()) {
                gazetteerGrid.doGazetteerSearch(value, limitToBBox);
                gazetteerGrid.expand();
            } else {
                gazetteerGrid.getStore().removeAll();
            }
        } else {
            Ext.log.error("ObjectSearchGrid not found");
        }

    },

    doObjectSearch: function(value){

        var me = this;

        var objectSearchGrid =
            Ext.ComponentQuery.query(me.getWfsSearchGrid())[0];

        if (objectSearchGrid) {
            if (me.getWfsSearch()) {
                objectSearchGrid.describeFeatureTypes(value, me);
                objectSearchGrid.expand();
            } else {
                objectSearchGrid.getStore().removeAll();
            }
        } else {
            Ext.log.error("ObjectSearchGrid not found");
        }

    },

    showResults: function() {
        var me = this;
        var parentItem;
        var position;
        var searchContainer;

        if (!me.searchContainer) {

            parentItem = me.getEl();

            position = {
                    top: parentItem.getClientRegion().bottom + "px",
                    left: parentItem.getClientRegion().left + "px",
                    width: parentItem.getWidth() + "px"
            };

            searchContainer = Ext.create(Ext.container.Container, {
                renderTo: Ext.getBody(),

                items: [
                        {
                            xtype: me.getGazetteerGrid()
                        },{
                            xtype: me.getWfsSearchGrid()
                        }
                        ],

                        width: position.width,

                        style: {
                            'top': position.top,
                            'left': position.left
                        }

            });

            me.searchContainer = searchContainer;
        }

        me.searchContainer.show();
    },

    refreshSearchResults: function(){
        var me = this;

        var value = me.getValue();

        if (value) {
            me.doGazetteerSearch(value);
            me.doObjectSearch(value);
        } else {
            Ext.log.error("No value to search for");
        }
    },

    showSettingsWindow: function(){
        var me = this;
        var settingsWindow;

        if (me.settingsWindow) {
            if (me.settingsWindow.hidden) {
                me.settingsWindow.show();
            } else {
                BasiGX.util.Animate.shake(me.settingsWindow);
            }
        } else {
            settingsWindow = Ext.create('Ext.window.Window', {
                items: [{
                    xtype: me.getSearchSettings(),
                    combo: me
                }],
                title: me.getViewModel().get('settingsWindowTitle'),
                closeAction: 'hide',
                autoShow: true
            });
            me.settingsWindow = settingsWindow;
        }

    }

});
