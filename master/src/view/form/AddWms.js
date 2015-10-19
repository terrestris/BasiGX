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
 * AddWms FormPanel
 *
 * Used to add an WMS to the map
 *
 */
Ext.define("BasiGX.view.form.AddWms", {
    extend: "Ext.form.Panel",
    xtype: 'basigx-form-addwms',

    requires: [
        'Ext.button.Button'
    ],

    viewModel: {
        data: {
            errorIncompatibleWMS:
                'Der angefragte WMS ist nicht kompatibel zur Anwendung',
            errorRequestFailedS:
                'Die angegebene URL konte nicht abgefragt werden',
            errorCouldntParseResponse:
                'Die erhaltene Antwort konnte nicht erfolgreich geparst werden',
            addCheckedLayers:
                'Ausgewählte Layer hinzufügen'
        }
    },

    padding: 5,
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    scrollable: true,

    items: [
        {
            xtype: 'fieldset',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            title: 'Anfrageparameter',
            items: [{
                xtype: 'textfield',
                fieldLabel: 'WMS-URL',
                name: 'url',
                allowBlank: false,
                value: 'http://ows.terrestris.de/osm/service'
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: 'Version',
                defaultType: 'radiofield',
                defaults: {
                    flex: 1
                },
                layout: 'hbox',
                items: [
                    {
                        boxLabel: 'v1.1.1',
                        name: 'version',
                        inputValue: '1.1.1',
                        id: 'v111-radio'
                    }, {
                        boxLabel: 'v1.3.0',
                        name: 'version',
                        inputValue: '1.3.0',
                        id: 'v130-radio',
                        checked: true
                    }
                ]
            }, {
                xtype: 'hiddenfield',
                name: 'request',
                value: 'GetCapabilities'
            }, {
                xtype: 'hiddenfield',
                name: 'service',
                value: 'WMS'
            }]
        },
        {
            xtype: 'fieldset',
            name: 'fs-available-layers',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            title: 'Verfügbare Layer'
        }
    ],

    // Reset and Submit buttons
    buttons: [{
        text: 'Zurücksetzen',
        handler: function(btn){
            var view = btn.up('basigx-form-addwms');
            view.getForm().reset();
            view.emptyAvailableLayersFieldset();
        }
    }, '->', {
        text: 'Verfügbare Layer abfragen',
        formBind: true, //only enabled once the form is valid
        disabled: true,
        handler: function(btn){
            var view = btn.up('basigx-form-addwms');
            var viewModel = view.getViewModel();
            var form = view.getForm();

            if (form.isValid()) {
                view.emptyAvailableLayersFieldset();

                var values = form.getValues();
                var url = values.url;
                delete values.url;

                Ext.Ajax.request({
                    url: url,
                    method: 'GET',
                    params: values,
                    success: function(response) {
                        var parser = new ol.format.WMSCapabilities();
                        var result;
                        try {
                            result = parser.read(response.responseText);
                        } catch(ex) {
                            view.showWarning(
                                viewModel.get('errorCouldntParseResponse')
                            );
                            return;
                        }
                        var compatibleLayers =
                            view.isCompatibleCapabilityResponse(result);
                        if (!compatibleLayers) {
                            view.showWarning(
                                viewModel.get('errorIncompatibleWMS')
                            );
                            return;
                        }
                        view.fillAvailableLayersFieldset(compatibleLayers);
                    },
                    failure: function() {
                        view.showWarning(viewModel.get('errorRequestFailedS'));
                    }
                });
            }
        }
    }],


    emptyAvailableLayersFieldset: function(){
        var fs = this.down('[name="fs-available-layers"]');
        fs.removeAll();
    },

    showWarning: function(msg) {
        Ext.Msg.show({
            title: 'Warnung',
            message: 'Ein Fehler trat auf: ' + msg,
            width: 300,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
    },

    isCompatibleCapabilityResponse: function (capabilities) {
        if (!capabilities) {
            return false;
        }
        var version = capabilities.version;
        if (version !== '1.1.1' && version !== '1.3.0') {
            return false;
        }
        var compatible = [];
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        var mapProj = map.getView().getProjection().getCode();

        var layers = capabilities.Capability.Layer.Layer;//same in both versions
        var url = capabilities.Capability.Request.GetMap.
            DCPType[0].HTTP.Get.OnlineResource;
        Ext.each(layers, function(layer){
            if (version === '1.3.0' &&
                !Ext.Array.contains(layer.CRS, mapProj)) {
               // only available for 1.3.0
                return;
            }
            var olSource = new ol.source.TileWMS({
                url: url,
                params: {
                    LAYERS: layer.Name,
                    STYLES: layer.Style[0].Name,
                    VERSION: version
                }
            });
            var olLayer = new ol.layer.Tile({
                topic: true,
                name: layer.Title,
                source: olSource,
                legendUrl: layer.Style[0].LegendURL[0].OnlineResource
            });
            compatible.push(olLayer);
        });

        return compatible.length > 0 ? compatible : false;
    },

    fillAvailableLayersFieldset: function(layers){
        this.emptyAvailableLayersFieldset();
        var view = this;
        var fs = view.down('[name="fs-available-layers"]');
        var viewModel = this.getViewModel();
        Ext.each(layers, function(layer){
            fs.add({
                xtype: 'checkbox',
                boxLabel: layer.get('name'),
                checked: true,
                olLayer: layer
            });
        });
        fs.add({
            xtype: 'button',
            text: viewModel.get('addCheckedLayers'),
            margin: 10,
            handler: this.addCheckedLayers,
            scope: this
        });
    },

    addCheckedLayers: function() {
        var fs = this.down('[name="fs-available-layers"]');
        var checkboxes = fs.query('checkbox[checked=true][disabled=false]');
        var map = Ext.ComponentQuery.query('gx_map')[0].getMap();
        Ext.each(checkboxes, function(checkbox) {
            map.addLayer(checkbox.olLayer);
            checkbox.setDisabled(true);
        });
    }
});
