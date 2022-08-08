/* Copyright (c) 2022-present terrestris GmbH & Co. KG
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
 * AddArcGISRest FormPanel
 *
 * Used to add an ArcGIS REST layer to the map
 *
 * @class BasiGX.view.form.AddArcGISRest
 */
Ext.define('BasiGX.view.form.AddArcGISRest', {
    extend: 'Ext.form.Panel',
    xtype: 'basigx-form-addarcgisrest',

    requires: [
        'Ext.button.Button',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.form.CheckboxGroup',
        'Ext.Promise',
        'BasiGX.util.Map',
        'BasiGX.util.MsgBox',
        'BasiGX.util.Url',
        'BasiGX.util.ArcGISRest'
    ],

    viewModel: {
        data: {
            queryParamsFieldSetTitle: 'Anfrageparameter',
            arcGISUrlTextFieldLabel: 'ArcGIS Service URL',
            availableLayersFieldSetTitle: 'Verfügbare Layer',
            resetBtnText: 'Zurücksetzen',
            requestLayersBtnText: 'Verfügbare Layer abfragen',
            checkAllLayersBtnText: 'Alle auswählen',
            uncheckAllLayersBtnText: 'Nichts auswählen',
            addCheckedLayersBtnText: 'Ausgewählte Layer hinzufügen',
            errorRequestFailed: 'Die angegebene URL konnte nicht abgefragt ' +
                    'werden',
            msgRequestTimedOut: 'Die Anfrage wurde nicht schnell genug ' +
                    'beantwortet und abgebrochen',
            msgCorsMisconfiguration: 'HTTP access control (CORS) auf dem ' +
                    'Zielserver vermutlich nicht korrekt konfiguriert',
            msgUnauthorized: 'Der Client ist nicht gegenüber dem Zielserver ' +
                    'authentifiziert',
            msgForbidden: 'Der Client hat keinen Zugriff auf die angefragte ' +
                    'Ressource',
            msgFileNotFound: 'Die angefragte Ressource existiert nicht',
            msgTooManyRequests: 'Der Client hat zu viele Anfragen gestellt',
            msgServiceUnavailable: 'Der Server ist derzeit nicht verfügbar ' +
                    '(zu viele Anfragen bzw. Wartungsmodus)',
            msgGatewayTimeOut: 'Der Server fungierte als Gateway und das ' +
                    'Originalziel hat zu langsam geantwortet',
            msgClientError: 'Ein unspezifizierter Clientfehler ist aufgetreten',
            msgServerError: 'Ein unspezifizierter Serverfehler ist aufgetreten',
            msgInvalidUrl: 'Die angegebene URL ist keine valide ArcGISRest URL',
            documentation: '<h2>ArcGISRest Layer hinzufügen</h2>• In ' +
                'diesem Dialog können Sie mit Hilfe einer ArcGISRest-URL ' +
                'einen beliebigen Kartendienst der Karte hinzufügen.'
        }
    },

    config: {
        /**
         * Whether layers shall start `checked` or `unchecked` in the available
         * layers fieldset.
         */
        candidatesInitiallyChecked: false,

        /**
         * Whether to add a `Check all layers` button to the toolbar to interact
         * with the layers of a ArcGIS Rest response.
         */
        hasCheckAllBtn: false,

        /**
         * Whether to add a `Uncheck all layers` button to the toolbar to
         * interact with the layers of a ArcGIS Rest response.
         */
        hasUncheckAllBtn: false,

        /**
         * With these ArcGIS urls we fill the combobox. If this is
         * empty (default), no combobox will be rendered but a plain textfield.
         */
        arcGISBaseUrls: [],

        /**
         * Defines a URL which will be appended to all service requests.
         * Especially useful when dealing with CORS problems.
         */
        proxyUrl: null,

        /**
         * Default url for the textfield or combobox.
         */
        defaultUrl: 'https://gis.epa.ie/arcgis/rest/services',

        /**
         * Whether we will send the `X-Requested-With` header when fetching the
         * document from the URL. The `X-Requested-With` header is
         * usually added for XHR, but adding it should lead to a preflight
         * request (see https://goo.gl/6JzdUI), which some servers fail.
         *
         * @type {Boolean}
         */
        useDefaultXhrHeader: false
    },

    /**
     * Keeps track of the viewModel key of the last error (if any).
     *
     * @private
     */
    lastErrorMsgKey: null,

    defaultButton: 'requestLayersBtn',

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
                    fieldLabel: '{arcGISUrlTextFieldLabel}'
                },
                name: 'url',
                allowBlank: false,
                value: null,
                listeners: {
                    change: function(textfield) {
                        var view = textfield.up('basigx-form-addarcgisrest');
                        view.resetState();
                    },
                    beforerender: function(textfield) {
                        var view = textfield.up('basigx-form-addarcgisrest');
                        var countUrls = view.arcGISBaseUrls.length;
                        if (countUrls !== 0) {
                            textfield.setHidden(true);
                        }
                    }
                }
            }, {
                xtype: 'combobox',
                bind: {
                    fieldLabel: '{arcGISUrlTextFieldLabel}'
                },
                store: null,
                name: 'urlCombo',
                allowBlank: false,
                value: null,
                listeners: {
                    change: function(combobox) {
                        var view = combobox.up('basigx-form-addarcgisrest');
                        view.resetState();
                    },
                    beforerender: function(combobox) {
                        var view = combobox.up('basigx-form-addarcgisrest');
                        var countUrls = view.arcGISBaseUrls.length;
                        if (countUrls === 0) {
                            combobox.setHidden(true);
                        } else {
                            var urls = view.arcGISBaseUrls;
                            combobox.setStore(urls);
                        }
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
                title: '{availableLayersFieldSetTitle}'
            },
            items: {
                xtype: 'checkboxgroup',
                listeners: {
                    change: {
                        fn: function(cbGroup) {
                            var form = cbGroup.up('basigx-form-addarcgisrest');
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
            name: 'resetFormBtn',
            bind: {
                text: '{resetBtnText}'
            },
            handler: function(btn) {
                var view = btn.up('basigx-form-addarcgisrest');
                view.getForm().reset();
                view.removeAddLayersComponents();
                view.resetState();
                var defaultValue = view.defaultUrl;
                var combo = view.down('combobox[name=urlCombo]');
                combo.setValue(defaultValue);
                var textfield = view.down('textfield[name=url]');
                textfield.setValue(defaultValue);
            }
        },
        '->',
        {
            bind: {
                text: '{requestLayersBtnText}'
            },
            name: 'requestLayersBtn',
            reference: 'requestLayersBtn',
            formBind: true, // only enabled once the form is valid
            disabled: true,
            handler: function(btn) {
                var view = btn.up('basigx-form-addarcgisrest');
                view.resetState();
                view.requestLayers()
                    .then(
                        view.onGetServicesSuccess.bind(view),
                        view.onGetServicesFailure.bind(view)
                    );
            }
        }
    ],

    /**
     * Initializes the form and sets up the parser instance.
     */
    initComponent: function() {
        var me = this;
        me.callParent();
        var defaultValue = me.defaultUrl;
        var combo = me.down('combobox[name=urlCombo]');
        var textfield = me.down('textfield[name=url]');
        combo.setValue(defaultValue);
        textfield.setValue(defaultValue);
    },

    /**
     * Resets our internal state tracking properties for tracking the tried
     * versions and the last error message key we have determined.
     *
     * @private
     */
    resetState: function() {
        var me = this;
        me.lastErrorMsgKey = null;
    },

    /**
     * Will be called with the `get layers` button. Issues an ArcGIS Rest folder
     * request and sets up handlers for reacting on the response.
     *
     * @return {Ext.Promise} The resolved request.
     */
    requestLayers: function() {
        var me = this;
        var form = me.getForm();
        if (!form.isValid()) {
            return;
        }
        me.setLoading(true);
        me.uncheckAllLayers();
        me.removeAddLayersComponents();
        var values = form.getValues();
        var url = '';
        var originalUrl = '';

        if (me.getProxyUrl()) {
            url += me.getProxyUrl();
        }

        if (me.arcGISBaseUrls.length === 0) {
            originalUrl = values.url;
        } else {
            originalUrl = values.urlCombo;
        }

        if (!BasiGX.util.ArcGISRest.isArcGISRestUrl(originalUrl)) {
            me.setLoading(false);
            BasiGX.warn(me.getErrorMessage('msgInvalidUrl'), []);
            return;
        }

        url += originalUrl;

        url = BasiGX.util.Url.setQueryParam(url, 'f', 'json');

        return Ext.Ajax.request({
            url: url,
            method: 'POST',
            useDefaultXhrHeader: me.getUseDefaultXhrHeader()
        });
    },

    /**
     * Called if we could successfully query the services of an
     * ArcGISRest folder. This method will examine the answer
     * and eventually set up a fieldset for all the services that
     * we have found in the server's answer.
     *
     * @param {XMLHttpRequest} response The response of the request.
     */
    onGetServicesSuccess: function(response) {
        try {
            var responseJson = JSON.parse(response.responseText);
            var hasServicesKey = Object.prototype.hasOwnProperty.call(
                responseJson, 'services'
            );
            if (!hasServicesKey) {
                throw new Error('Response has no key "services"');
            }
        } catch (e) {
            Ext.log.warn('Could not get services', e);
            this.setLoading(false);
            BasiGX.warn(this.getErrorMessage('msgServerError', []));
            return;
        }
        var services = responseJson.services;

        var layerConfigs = Ext.Array.map(services, function(service) {
            return {
                service: service,
                url: response.request.url
            };
        });
        // TODO remove this as soon as FeatureServer is supported.
        layerConfigs = Ext.Array.filter(
            layerConfigs, function(layerConfig) {
                var isMapServer = layerConfig.service.type === 'MapServer';
                var isImageServer = layerConfig.service.type === 'ImageServer';
                return isMapServer || isImageServer;
            }
        );
        this.fillAvailableLayersFieldset(layerConfigs);
        this.updateControlToolbarState();
        this.setLoading(false);
    },

    /**
     * Called if we could not successfully query for the services of an
     * ArcGISRest folder.
     *
     * @param {XMLHttpRequest} response The response of the request.
     */
    onGetServicesFailure: function(response) {
        var me = this;
        var status = response.status;
        var errDetails = [];
        // Keep track of the last error, to eventually inform the user
        me.lastErrorMsgKey = me.responseStatusToErrorMsgKey(status);

        // we might simply have timed out
        if (response.timedout) {
            me.lastErrorMsgKey = 'msgRequestTimedOut';
        }

        me.setLoading(false);
        BasiGX.warn(me.getErrorMessage('errorRequestFailed', errDetails));
    },

    /**
     * Returns a key for a viewModel property for the passed HTTP status code or
     * null if we don't consider the status code an error.
     *
     * @param {Number} status The HTTP status code of the last response.
     * @return {String} An error message key to be looked up in the viewModel.
     * @private
     */
    responseStatusToErrorMsgKey: function(status) {
        status = parseInt(status, 10);
        // handle very common ones specifically
        if (status === 0) {
            // Most likely CORS
            // * either not enabled at all
            // * or misconfigured
            return 'msgCorsMisconfiguration';
        } else if (status === 401) {
            return 'msgUnauthorized';
        } else if (status === 403) {
            return 'msgForbidden';
        } else if (status === 404) {
            return 'msgFileNotFound';
        } else if (status === 429) {
            return 'msgTooManyRequests';
        } else if (status === 503) {
            return 'msgServiceUnavailable';
        } else if (status === 504) {
            return 'msgGatewayTimeOut';
        } else if (status >= 400 && status < 500) {
            return 'msgClientError';
        } else if (status >= 500) {
            return 'msgServerError';
        }
        return null;
    },

    /**
     * Returns the error message to display to the user for the passed key,
     * optionally adding the passed details.
     *
     * @param {String} errorKey The key to look up in the view model for the
     *     error.
     * @param {Array<String>} [errorDetails] Optional array of details to
     *     display.
     * @return {String} The error message to display.
     * @private
     */
    getErrorMessage: function(errorKey, errorDetails) {
        var me = this;
        var viewModel = me.getViewModel();

        var msg = viewModel.get(errorKey);
        if (me.lastErrorMsgKey !== null) {
            msg += '<br /><br />' + viewModel.get(me.lastErrorMsgKey);
        }
        if (errorDetails && errorDetails.length > 0) {
            msg += '<ul>';
            Ext.each(errorDetails, function(errorDetail) {
                msg += '<li>' + errorDetail + '</li>';
            });
            msg += '</ul>';
        }
        return msg;
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
     * Takes an array of ArcGIS layer configs and updates the
     * available layers fieldset with matching entries.
     *
     * @param {object[]} layers The ArcGIS layer configs for which we shall fill
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
                boxLabel: layer.service.name,
                checked: candidatesInitiallyChecked,
                arcGISLayerConfig: layer
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
     * Examines the available layers fieldset, and adds all checked layers to
     * the map.
     */
    addCheckedLayers: function() {
        var me = this;
        var fs = me.down('[name=fs-available-layers]');
        var checkboxes = fs.query('checkbox[checked=true][disabled=false]');
        var map = BasiGX.util.Map.getMapComponent().getMap();
        var useDefaultHeader = me.getUseDefaultXhrHeader();
        Ext.each(checkboxes, function(checkbox) {
            var config = checkbox.arcGISLayerConfig;
            BasiGX.util.ArcGISRest.createOlLayerFromArcGISRest(
                config, useDefaultHeader
            )
                .then(function(layer) {
                    if (!layer) {
                        return;
                    }
                    me.fireEvent('beforearcgisrestadd', layer);
                    map.addLayer(layer);
                    me.fireEvent('arcgisrestadd', layer);
                    checkbox.setDisabled(true);
                    me.updateControlToolbarState();
                });
        });
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
