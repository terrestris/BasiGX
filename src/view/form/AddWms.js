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
 * AddWms FormPanel
 *
 * Used to add an WMS to the map
 *
 * @class BasiGX.view.form.AddWms
 */
Ext.define('BasiGX.view.form.AddWms', {
    extend: 'Ext.form.Panel',
    xtype: 'basigx-form-addwms',

    requires: [
        'Ext.app.ViewModel',
        'Ext.button.Button',
        'Ext.form.CheckboxGroup',
        'Ext.form.FieldContainer',
        'Ext.form.FieldSet',
        'Ext.form.field.Text',
        'Ext.form.field.Hidden',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Radio',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.Anchor',
        'Ext.layout.container.HBox',
        'Ext.toolbar.Toolbar',

        'BasiGX.util.Map',
        'BasiGX.util.MsgBox'
    ],

    viewModel: {
        data: {
            queryParamsFieldSetTitle: 'Anfrageparameter',
            wmsUrlTextFieldLabel: 'WMS-URL',
            wmsVersionContainerFieldLabel: 'Version',
            availableLayesFieldSetTitle: 'Verfügbare Layer',
            resetBtnText: 'Zurücksetzen',
            requestLayersBtnText: 'Verfügbare Layer abfragen',
            checkAllLayersBtnText: 'Alle auswählen',
            uncheckAllLayersBtnText: 'Nichts auswählen',
            addCheckedLayersBtnText: 'Ausgewählte Layer hinzufügen',
            errorIncompatibleWMS: 'Der angefragte WMS ist nicht kompatibel ' +
                    'zur Anwendung',
            errorRequestFailed: 'Die angegebene URL konte nicht abgefragt ' +
                    'werden',
            errorCouldntParseResponse: 'Die erhaltene Antwort konnte nicht ' +
                    'erfolgreich geparst werden'
        }
    },

    padding: 5,
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    scrollable: true,


    config: {

        /**
         * Whether layers shall start `checked` or `unchecked` in the available
         * layers fieldset.
         */
        candidatesInitiallyChecked: true,

        /**
         * Whether to add a `Check all layers` button to the toolbar to interact
         * with the layers of a GetCapabilities response.
         */
        hasCheckAllBtn: false,

        /**
         * Whether to add a `Uncheck all layers` button to the toolbar to
         * interactthe with the layers of a GetCapabilities response.
         */
        hasUncheckAllBtn: false,

        /**
         * Whether to include sublayers when creting the list of available
         * layers.
         */
        includeSubLayer: false,

        /**
         * The WMS versions we try to use in the getCapabilities requests.
         */
        versionArray: ['1.3.0', '1.1.1'],

        /**
         * WMS versions we already tried to request the getCapabilities document
         */
        triedVersions: [],

        /**
         * Whether to change the WMS versions manually.
         */
        versionsWmsAutomatically: false,

        /**
         * With the WMS urls we try to fill the combobox.
         */
        wmsBaseUrls: [],

        /**
         * Default url for the textfield or combobox.
         */
        defaultUrl: 'http://ows.terrestris.de/osm/service'

    },

    /**
     * The ol.format.WMSCapabilities which we use to parse any responses. Will
     * be set in `initComponent`
     *
     * @private
     */
    parser: null,

    items: [
        {
            xtype: 'fieldset',
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            bind: {
                title: '{queryParamsFieldSetTitle}'
            },
            items: [{
                xtype: 'textfield',
                bind: {
                    fieldLabel: '{wmsUrlTextFieldLabel}'
                },
                name: 'url',
                allowBlank: false,
                value:  null,
                listeners: {
                    change: function(textfield) {
                        var view = textfield.up('basigx-form-addwms');
                        view.setTriedVersions([]);
                    },
                    beforerender: function(textfield) {
                        var view = textfield.up('basigx-form-addwms');
                        var countUrls = view.wmsBaseUrls.length;
                        if(countUrls !== 0) {
                            textfield.setHidden(true);
                        }
                    }
                }
            }, {
                xtype: 'combobox',
                bind: {
                    fieldLabel: '{wmsUrlTextFieldLabel}'
                },
                store: null,
                name: 'urlCombo',
                allowBlank: false,
                autoRender: true,
                editable: true,
                value:  null,
                listeners: {
                    change: function(combobox) {
                        var view = combobox.up('basigx-form-addwms');
                        view.setTriedVersions([]);
                    },
                    beforerender: function(combobox) {
                        var view = combobox.up('basigx-form-addwms');
                        var countUrls = view.wmsBaseUrls.length;
                        if (countUrls === 0) {
                            combobox.setHidden(true);
                        } else {
                            var urlWms = view.wmsBaseUrls;
                            combobox.setStore(urlWms);
                        }
                    }
                }
            }, {
                xtype: 'fieldcontainer',
                bind: {
                    fieldLabel: '{wmsVersionContainerFieldLabel}'
                },
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
                ],
                listeners: {
                    beforerender: function(fieldcontainer) {
                        var view = fieldcontainer.up('basigx-form-addwms');
                        var bool = view.versionsWmsAutomatically;
                        fieldcontainer.setHidden(bool);
                    }
                }
            }]
        },
        {
            xtype: 'fieldset',
            name: 'fs-available-layers',
            layout: 'anchor',
            scrollable: 'y',
            maxHeight: 200,
            defaults: {
                anchor: '100%'
            },
            bind: {
                title: '{availableLayesFieldSetTitle}'
            },
            items: {
                xtype: 'checkboxgroup',
                listeners: {
                    change: {
                        fn: function(cbGroup) {
                            var form = cbGroup.up('basigx-form-addwms');
                            form.updateControlToolbarState();
                        },
                        buffer: 50
                    }
                },
                columns: 2,
                vertical: true
            }
        }
    ],

    // Reset and Submit buttons
    buttons: [
        {
            bind: {
                text: '{resetBtnText}'
            },
            handler: function(btn) {
                var view = btn.up('basigx-form-addwms');
                view.getForm().reset();
                view.removeAddLayersComponents();
                view.setTriedVersions([]);
            }
        },
        '->',
        {
            bind: {
                text: '{requestLayersBtnText}'
            },
            formBind: true, // only enabled once the form is valid
            disabled: true,
            handler: function(btn) {
                var view = btn.up('basigx-form-addwms');
                view.setTriedVersions([]);
                view.requestGetCapabilities();
            }
        }
    ],

    /**
     * Initializes the form and sets up the parser instance.
     */
    initComponent: function() {
        this.callParent();
        this.parser = new ol.format.WMSCapabilities();
        var defaultValue = this.defaultUrl;
        var combo = this.down('combobox[name=urlCombo]');
        var textfield = this.down('textfield[name=url]');
        combo.setValue(defaultValue);
        textfield.setValue(defaultValue);
    },

    /**
     * Will be called with the `get layers` button. Issues a GetCapabilities
     * request and sets up handlewrs for reacting on the response.
     */
    requestGetCapabilities: function() {
        var me = this;
        var form = me.getForm();
        if (form.isValid()) {
            me.setLoading(true);
            me.removeAddLayersComponents();
            var values = form.getValues();
            var url;

            if (me.wmsBaseUrls.length === 0) {
                url = values.url;
            } else {
                url = values.urlCombo;
            }

            var version;
            var versionAutomatically = me.versionsWmsAutomatically;

            if (versionAutomatically === false) {
                version = values.version;
            } else {
                // try to detect the WMS version we should try next
                var triedVersions = me.getTriedVersions();
                var versionsToTry = me.getVersionArray();

                Ext.each(versionsToTry, function(currentVersion) {
                    var alreadyTried = Ext.Array.contains(
                    triedVersions, currentVersion
                  );

                    if (!alreadyTried) {
                        version = currentVersion;
                        triedVersions.push(currentVersion);
                        return false;
                    }
                });
            }

            if (!version) {
                // should only happen if all versions
                // have been tried unsuccessful
                me.setLoading(false);
                BasiGX.warn(me.getViewModel().get('errorRequestFailed'));
                return;
            }

            Ext.Ajax.request({
                url: url,
                method: 'GET',
                params: {
                    REQUEST: 'GetCapabilities',
                    SERVICE: 'WMS',
                    VERSION: version
                },
                scope: me,
                success: me.onGetCapabilitiesSuccess,
                failure: me.onGetCapabilitiesFailure
            });
        }
    },

    /**
     * Called if we could successfully query for the capabiliteis of a WMS, this
     * method will examine the answer and eventually set up a fieldset for all
     * the layers that we have found in the server's answer.
     *
     * @param {XMLHttpRequest} response The response of the request.
     */
    onGetCapabilitiesSuccess: function(response) {
        var me = this;
        var viewModel = me.getViewModel();
        var parser = me.parser;
        var result;
        var isLastAvailableVersion = me.getVersionArray().length ===
          me.getTriedVersions().length;
        try {
            result = parser.read(response.responseText);
        } catch (ex) {
            if (isLastAvailableVersion) {
                BasiGX.warn(viewModel.get('errorCouldntParseResponse'));
                return;
            }
            me.requestGetCapabilities();
            return;
        }
        var compatibleLayers = me.isCompatibleCapabilityResponse(result);
        if (!compatibleLayers) {
            if (isLastAvailableVersion) {
                BasiGX.warn(viewModel.get('errorIncompatibleWMS'));
                return;
            }
            me.requestGetCapabilities();
            return;
        }
        me.fillAvailableLayersFieldset(compatibleLayers);
        me.updateControlToolbarState();
        me.setLoading(false);
    },

    /**
     * Called if we could not successfully query for the capabilities of a WMS.
     *
     * @param {XMLHttpRequest} response The response of the request.
     */
    onGetCapabilitiesFailure: function() {
        var me = this;
        var versionAutomatically = me.versionsWmsAutomatically;
        if (versionAutomatically === false) {
            me.setLoading(false);
            BasiGX.warn(this.getViewModel().get('errorRequestFailed'));
            return;
        } else {
            // we will try another WMS version automatically...
            this.requestGetCapabilities();
        }
    },

    /**
     * Updates the disabled state of the buttons to control the layer
     * checkboxes (e.g. check all, uncheck all, add selected).
     */
    updateControlToolbarState: function() {
        var me = this;
        var cbGroup = me.down('[name=fs-available-layers] checkboxgroup');
        var allCbs = cbGroup.query('checkbox');
        var allChecked = cbGroup.query('[checked=true]');
        var allDisabled = cbGroup.query('[disabled=true]');
        var checkAllBtn = me.down('[name=check-all-layers]');
        var uncheckAllBtn = me.down('[name=uncheck-all-layers]');
        var addBtn = me.down('[name=add-checked-layers]');
        if (allCbs.length === 0) {
            // no checkboxes, also no control toolbar, return
            return;
        }
        if (allDisabled.length === allCbs.length) {
            // all checkboxes are disabled, all controls can be disabled
            addBtn.setDisabled(true);
            if (checkAllBtn) {
                checkAllBtn.setDisabled(true);
            }
            if (uncheckAllBtn) {
                uncheckAllBtn.setDisabled(true);
            }
            return;
        }
        if (allChecked.length > 0) {
            // at least one checkbox is checked
            addBtn.setDisabled(false);
        } else {
            // not even one is checked
            addBtn.setDisabled(true);
        }

        if (checkAllBtn) {
            if (allCbs.length === allChecked.length) {
                // all are checked already
                checkAllBtn.setDisabled(true);
            } else {
                checkAllBtn.setDisabled(false);
            }
        }
        if (uncheckAllBtn) {
            if (allChecked.length === 0) {
                // not a single one is checked
                uncheckAllBtn.setDisabled(true);
            } else {
                uncheckAllBtn.setDisabled(false);
            }
        }
    },

    /**
     * Remove the checkboxes for layers from previous requests, and also the
     * interact-toolbar.
     */
    removeAddLayersComponents: function() {
        var me = this;
        var cbGroup = me.down('[name=fs-available-layers] checkboxgroup');
        var tb = me.down('toolbar[name=interact-w-available-layers]');
        cbGroup.removeAll();
        if (tb) {
            me.remove(tb);
        }
    },

    /**
     * A utility method that creates an ol.layer.Tile with a ol.source.TileWMS
     * from the properties of a layer from a getCapabilities response.
     *
     * @param {Object} capLayer A layer from a GetCapabilities response
     * @param {String} version The WMS version.
     * @param {String} mapProj The map projection as string.
     * @param {String} url The WMS URL.
     * @return {ol.layer.Tile} The created layer or `undefined`.
     */
    getOlLayer: function(capLayer, version, mapProj, url) {
        // This really should not matter, as ol3 can reproject in the client
        // At least it shoudl be configurable
        if (version === '1.3.0' &&
            Ext.isArray(capLayer.CRS) &&
            !Ext.Array.contains(capLayer.CRS, mapProj)) {
            // only available for 1.3.0
            return;
        }
        var style = capLayer.Style;
        var olSource = new ol.source.TileWMS({
            url: url,
            params: {
                LAYERS: capLayer.Name,
                STYLES: style ? style[0].Name : '',
                VERSION: version
            }
        });
        var olLayer = new ol.layer.Tile({
            topic: true,
            name: capLayer.Title,
            source: olSource,
            legendUrl: style ? style[0].LegendURL[0].OnlineResource : null
        });
        return olLayer;
    },

    /**
     * Checks if the passed capabilities object (from the #parser) is
     * compatible. It woill return an array of layers if we could determine any,
     * and the boolean value `false` if not.
     *
     * @param {Object} capabilities The GetCapabbilties object as it is returned
     *     by our parser.
     * @return {ol.layer.Tile[]|boolean} Eitehr an array of comüatible layers or
     *     'false'.
     */
    isCompatibleCapabilityResponse: function(capabilities) {
        var me = this;
        if (!capabilities) {
            return false;
        }
        var version = capabilities.version;
        if (version !== '1.1.1' && version !== '1.3.0') {
            return false;
        }
        var compatible = [];
        var map = BasiGX.util.Map.getMapComponent().getMap();
        var mapProj = map.getView().getProjection().getCode();

        // same in both versions
        var layers = capabilities.Capability.Layer.Layer;
        var url = capabilities.Capability.Request.GetMap.
            DCPType[0].HTTP.Get.OnlineResource;

        var includeSubLayer = me.getIncludeSubLayer();

        Ext.each(layers, function(layer) {
            var olLayer = me.getOlLayer(layer, version, mapProj, url);
            if (olLayer) {
                compatible.push(olLayer);
            }

            if (includeSubLayer && Ext.isArray(layer.Layer)) {
                Ext.each(layer.Layer, function(subLayer) {
                    var subOlLayer = me.getOlLayer(
                        subLayer, version, mapProj, url
                    );
                    if (subOlLayer) {
                        compatible.push(subOlLayer);
                    }
                });
            }
        });

        return compatible.length > 0 ? compatible : false;
    },

    /**
     * Takes an array of OpenLayers layers (as gathered by the method to fetch
     * them from the capabilities object #isCompatibleCapabilityResponse) and
     * updates the avaialable layers fieldset with matching entries.
     *
     * @param {ol.layer.Tile[]} layers The layers for which the we shall fill
     *     the fieldset.
     */
    fillAvailableLayersFieldset: function(layers) {
        var me = this;
        me.removeAddLayersComponents();
        var fs = me.down('[name=fs-available-layers]');
        var cbGroup = fs.down('checkboxgroup');
        var checkBoxes = [];
        var candidatesInitiallyChecked = me.getCandidatesInitiallyChecked();
        Ext.each(layers, function(layer) {
            checkBoxes.push({
                xtype: 'checkbox',
                boxLabel: layer.get('name'),
                checked: candidatesInitiallyChecked,
                olLayer: layer
            });
        });
        cbGroup.add(checkBoxes);

        var tbItems = [];

        if (me.getHasCheckAllBtn()) {
            tbItems.push({
                xtype: 'button',
                name: 'check-all-layers',
                bind: {
                    text: '{checkAllLayersBtnText}'
                },
                handler: me.checkAllLayers,
                scope: me
            });
        }

        if (me.getHasUncheckAllBtn()) {
            tbItems.push({
                xtype: 'button',
                name: 'uncheck-all-layers',
                bind: {
                    text: '{uncheckAllLayersBtnText}'
                },
                handler: me.uncheckAllLayers,
                scope: me
            });
        }

        tbItems.push('->');
        tbItems.push({
            xtype: 'button',
            name: 'add-checked-layers',
            bind: {
                text: '{addCheckedLayersBtnText}'
            },
            handler: me.addCheckedLayers,
            scope: me
        });

        me.add({
            xtype: 'toolbar',
            name: 'interact-w-available-layers',
            items: tbItems
        });
    },

    /**
     * Examines the available layers fieldset, and adds all checked layers to
     * the map.
     */
    addCheckedLayers: function() {
        var me = this;
        var fs = me.down('[name=fs-available-layers]');
        var checkboxes = fs.query('checkbox[checked=true][disabled=false]');
        var map = BasiGX.util.Map.getMapComponent().getMap();
        Ext.each(checkboxes, function(checkbox) {
            me.fireEvent('beforewmsadd', checkbox.olLayer);
            map.addLayer(checkbox.olLayer);
            me.fireEvent('wmsadd', checkbox.olLayer);
            checkbox.setDisabled(true);
        });
        me.updateControlToolbarState();
    },

    /**
     * Checks all checkboxes in the available layers fieldset.
     */
    checkAllLayers: function() {
        var sel = '[name=fs-available-layers] checkbox[disabled=false]';
        var checkboxes = this.query(sel);
        Ext.each(checkboxes, function(checkbox) {
            checkbox.setValue(true);
        });
    },

    /**
     * Unchecks all checkboxes in the available layers fieldset.
     */
    uncheckAllLayers: function() {
        var sel = '[name=fs-available-layers] checkbox[disabled=false]';
        var checkboxes = this.query(sel);
        Ext.each(checkboxes, function(checkbox) {
            checkbox.setValue(false);
        });
    }
});
