/* Copyright (c) 2015 terrestris GmbH & Co. KG
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
 *  A container showing settings for the multisearch including switching
 *  gazetter or wfs search on and off, limit search results to visible extent
 *  and configure layers for wfs search.
 *  This class is used by BasiGX.view.form.field.MultiSearchCombo
 *
 * @class BasiGX.view.container.MultiSearchSettings
 */
Ext.define("BasiGX.view.container.MultiSearchSettings", {
    extend: 'Ext.container.Container',
    xtype: 'basigx-container-multisearchsettings',

    requires: [
        "BasiGX.util.Layer",
        "Ext.form.field.Checkbox"
    ],

    viewModel: {
        data: {
            generalSettingsLabel: "Allgemeine Einstellungen",
            limitCboxLabel: "Auf den sichtbaren Kartenbereich einschränken",
            gazetteerLabel: "Gazetteer Suche verwenden",
            objectSearchLabel: "Object Suche verwenden",
            objectSearchLayersLabel: "Layer für Objektsuche",
            saveBtnText: "Sucheinstellungen speichern"
        }
    },

    autoScroll: true,

    constrainHeader: true,

    padding: 20,

    width: 500,

    config: {
        combo: null
    },

    items: [{
        xtype: 'form',
        width: '100%',
        items: [
            {
                xtype: 'fieldcontainer',
                name: 'generalsettings',
                bind: {
                    fieldLabel: '{generalSettingsLabel}'
                },
                defaultType: 'checkboxfield',
                labelWidth: 200,
                items: [
                    {
                        bind: {
                            boxLabel: '{limitCboxLabel}'
                        },
                        labelWidth: 200,
                        name: 'limitcheckbox',
                        checked: true
                    },{
                        bind: {
                            boxLabel: '{gazetteerLabel}'
                        },
                        labelWidth: 200,
                        name: 'gazetteersearch',
                        checked: true
                    },{
                        bind: {
                            boxLabel: '{objectSearchLabel}'
                        },
                        labelWidth: 200,
                        name: 'objectsearch',
                        checked: true
                    }
                 ]
            },{
                xtype: 'fieldcontainer',
                name: 'objectlayers',
                bind: {
                    fieldLabel: '{objectSearchLayersLabel}'
                },
                defaultType: 'checkboxfield',
                labelWidth: 200
            }
        ]
    },{
        xtype: 'button',
        bind: {
            text: '{saveBtnText}'
        },
        formBind: true,
        handler: function(btn) {
            var me = this.up();
            me.saveSettings(btn);
        }
    }],

    /**
    *
    */
    initComponent: function() {
        var me = this;

        me.callParent();

        me.setCombo(me.combo);

        me.on('beforerender', me.addLayers);
    },

    /**
    *
    */
    saveSettings: function(btn) {
        var me = btn.up();

        var win = me.up();

        var form = me.down('form');

        // set configured search layers to null and add the wanted below
        me.getCombo().setConfiguredSearchLayers([]);

        // set all configured values
        Ext.each(form.items.items, function(parentItem) {
            if (parentItem.name === 'generalsettings') {

                Ext.each(parentItem.items.items, function(item) {
                    if (item.name === 'objectsearch'){
                        me.getCombo().setWfsSearch(item.checked);
                    } else if (item.name === 'gazetteersearch'){
                        me.getCombo().setGazetteerSearch(item.checked);
                    } else if (item.name === 'limitcheckbox'){
                        me.getCombo().setLimitToBBox(item.checked);
                    }
                });

            } else if (parentItem.name === 'objectlayers' ) {

                Ext.each(parentItem.items.items, function(item) {
                    var l = BasiGX.util.Layer.getLayerByName(item.name);
                    if (this.checked) {
                        me.getCombo().configuredSearchLayers.push(l);
                    }
                });

            } else {
                Ext.log.error("Found setting for which no handler exists");
            }
        });

        win.setLoading(true);
        me.getCombo().refreshSearchResults();
        win.setLoading(false);
        win.close();
    },

    /**
    *
    */
    addLayers: function() {
        var me = this;

        var searchLayers = me.getCombo().getAllSearchLayers();

        var container = me.down('fieldcontainer[name="objectlayers"]');

        Ext.each(searchLayers, function(l) {
            var item = Ext.create('Ext.form.field.Checkbox', {
                labelWidth: 200,
                name: l.get('name'),
                boxLabel:  l.get('name'),
                checked: true
            });

            container.items.items.push(item);

        });

    }

});
