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
            errorRequestFailed: 'Die angegebene URL konnte nicht abgefragt ' +
                    'werden',
            errorCouldntParseResponse: 'Die erhaltene Antwort konnte nicht ' +
                    'erfolgreich geparst werden',
            msgRequestTimedOut: 'Die Anfrage wurde nicht schnell genug ' +
                    'beantwortet und abgebrochen',
            msgServiceException: 'Eine OGC ServiceException ist aufgetreten',
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
            documentation: '<h2>WMS hinzufügen</h2>• In diesem Dialog ' +
                'können Sie mit Hilfe einer WMS-URL ' +
                'einen beliebigen Kartendienst der Karte hinzufügen.'
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
        candidatesInitiallyChecked: false,

        /**
         * Whether to add a `Check all layers` button to the toolbar to interact
         * with the layers of a GetCapabilities response.
         */
        hasCheckAllBtn: false,

        /**
         * Whether to add a `Uncheck all layers` button to the toolbar to
         * interact with the layers of a GetCapabilities response.
         */
        hasUncheckAllBtn: false,

        /**
         * Whether to include sublayers when creating the list of available
         * layers.
         */
        includeSubLayer: false,

        /**
         * The WMS versions we try to use in the getCapabilities requests.
         */
        versionArray: ['1.3.0', '1.1.1'],

        /**
         * Whether to test the WMS versions in #versionArray automatically in
         * descending order. This will hide the user interface for manually
         * selecting the version to ask the WMS for.
         */
        autoDetectVersion: false,

        /**
         * With these WMS urls we fill the combobox. If this is empty (default),
         * no combobox will be rendered but a plain textfield.
         */
        wmsBaseUrls: [],

        /**
         * Defines a URL which will be appended to all capabilites requests.
         * Especially useful when dealing with CORS problems.
         */
        proxyUrl: null,

        /**
         * Default url for the textfield or combobox.
         */
        defaultUrl: 'https://ows.terrestris.de/osm/service',

        /**
         * Whether we will send the `X-Requested-With` header when fetching the
         * capabilities document from the URL. The `X-Requested-With` header is
         * usually added for XHR, but adding it should lead to a preflight
         * request (see https://goo.gl/6JzdUI), which some servers fail.
         *
         * @type {Boolean}
         */
        useDefaultXhrHeader: false,

        /**
         * Whether the request against the WMS servers will contain the ExtJS
         * cache buster (`_dc=123…`) or not. If set to `false`, the param will
         * not be send, if set to `true`, we'll pass it along (ExtJS default
         * behaviour).
         *
         * The name of this parameter is taken from the config option of
         * `Ext.Ajax`, turning the boolean logic around would be even more
         * confusing.
         *
         * Defaults to `true`, e.g. the cache buster will be send along in the
         * GET-request.
         *
         * @type {Boolean}
         */
        disableCaching: true
    },

    /**
     * The `ol.format.WMSCapabilities` which we use to parse any responses. Will
     * be set in `initComponent`
     *
     * @private
     */
    parser: null,

    /**
     * Keeps track of the viewModel key of the last error (if any).
     *
     * @private
     */
    lastErrorMsgKey: null,

    /**
     * The WMS versions we already tried to request the getCapabilities
     * document for.
     *
     * @private
     */
    triedVersions: [],

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
                    fieldLabel: '{wmsUrlTextFieldLabel}'
                },
                name: 'url',
                allowBlank: false,
                value: null,
                listeners: {
                    change: function(textfield) {
                        var view = textfield.up('basigx-form-addwms');
                        view.resetState();
                    },
                    beforerender: function(textfield) {
                        var view = textfield.up('basigx-form-addwms');
                        var countUrls = view.wmsBaseUrls.length;
                        if (countUrls !== 0) {
                            textfield.setHidden(true);
                            textfield.allowBlank = true;
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
                value: null,
                listeners: {
                    change: function(combobox) {
                        var view = combobox.up('basigx-form-addwms');
                        view.resetState();
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
                    // TODO generate from #versionArray?
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
                        fieldcontainer.setHidden(view.getAutoDetectVersion());
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
            name: 'resetFormBtn',
            bind: {
                text: '{resetBtnText}'
            },
            handler: function(btn) {
                var view = btn.up('basigx-form-addwms');
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
                var view = btn.up('basigx-form-addwms');
                view.resetState();
                view.requestGetCapabilities();
            }
        }
    ],

    /**
     * Initializes the form and sets up the parser instance.
     */
    initComponent: function() {
        var me = this;
        me.callParent();
        me.parser = new ol.format.WMSCapabilities();
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
        me.triedVersions = [];
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
     * Will be called with the `get layers` button. Issues a GetCapabilities
     * request and sets up handlers for reacting on the response.
     */
    requestGetCapabilities: function() {
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

        if (me.getProxyUrl()) {
            url += me.getProxyUrl();
        }

        if (me.wmsBaseUrls.length === 0) {
            url += values.url;
        } else {
            url += values.urlCombo;
        }

        var version;

        if (!me.getAutoDetectVersion()) {
            version = values.version;
        } else {
            // try to detect the WMS version we should try next
            var triedVersions = me.triedVersions;
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
            // should only happen if all versions have been tried and all failed
            me.setLoading(false);
            BasiGX.warn(me.getErrorMessage('errorRequestFailed'));
            return;
        }
        Ext.Ajax.request({
            url: url,
            method: 'GET',
            useDefaultXhrHeader: me.getUseDefaultXhrHeader(),
            disableCaching: me.getDisableCaching(),
            params: {
                REQUEST: 'GetCapabilities',
                SERVICE: 'WMS',
                VERSION: version
            },
            success: me.onGetCapabilitiesSuccess,
            failure: me.onGetCapabilitiesFailure,
            scope: me
        });
    },

    /**
     * Returns true if the passed responseText is a service exception report.
     *
     * @param {String} responseText The responseText of a request which is
     *     possibly a service exception report.
     * @return {Boolean} Whether the response is a service exception report
     *     document.
     */
    isServiceExceptionReport: function(responseText) {
        if (!responseText) {
            return false;
        }
        return (/<ServiceExceptionReport/g).test(responseText);
    },

    /**
     * Called if we could successfully query for the capabilities of a WMS, this
     * method will examine the answer and eventually set up a fieldset for all
     * the layers that we have found in the server's answer.
     *
     * @param {XMLHttpRequest} response The response of the request.
     */
    onGetCapabilitiesSuccess: function(response) {
        var me = this;

        me.lastErrorMsgKey = null;
        // some servers answer with a ServiceExceptionReport, e.g. when a server
        // only supports v1.1.1 but was requested with v1.3.0. In that case, we
        // have to manually call the failure callback.
        if (me.isServiceExceptionReport(response.responseText)) {
            me.onGetCapabilitiesFailure(response);
            return;
        }

        var viewModel = me.getViewModel();
        var parser = me.parser;
        var result;
        var isLastAvailableVersion = me.getVersionArray().length ===
          me.triedVersions.length;
        try {
            result = parser.read(response.responseText);
        } catch (ex) {
            if (isLastAvailableVersion) {
                BasiGX.warn(viewModel.get('errorCouldntParseResponse'));
                me.setLoading(false);
                return;
            }
            me.requestGetCapabilities();
            return;
        }
        var compatibleLayers = me.isCompatibleCapabilityResponse(result);
        if (!compatibleLayers) {
            if (isLastAvailableVersion) {
                BasiGX.warn(viewModel.get('errorIncompatibleWMS'));
                me.setLoading(false);
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
    onGetCapabilitiesFailure: function(response) {
        var me = this;
        var status = response.status;
        var responseText = response.responseText;
        var errDetails = [];
        // Keep track of the last error, to eventually inform the user
        me.lastErrorMsgKey = me.responseStatusToErrorMsgKey(status);

        // we might simply have timed out
        if (response.timedout) {
            me.lastErrorMsgKey = 'msgRequestTimedOut';
        }

        // If we still do not have a msg key and a OK status, check if it's a SE
        if (me.lastErrorMsgKey === null && status >= 200 && status < 300) {
            if (me.isServiceExceptionReport(responseText)) {
                // overwrite the key from the status, this should be considered
                // an error
                me.lastErrorMsgKey = 'msgServiceException';
                errDetails = me.exceptionDetailsFromReport(responseText);
            }
        }

        if (!me.getAutoDetectVersion()) {
            me.setLoading(false);
            BasiGX.warn(me.getErrorMessage('errorRequestFailed', errDetails));
            return;
        } else {
            // we will try another WMS version automatically…
            me.requestGetCapabilities();
        }
    },

    /**
     * Returns an array of `<ServiceException>` text contents of the passed
     * `<ServiceExceptionReport>` or an empty array.
     *
     * @param {String} exceptionReport An OGC ServiceExceptionReport as string.
     * @return {Array<String>} exceptionReport An array of `<ServiceException>`
     *     text contents of the passed `<ServiceExceptionReport>` or an empty
     *     array.
     */
    exceptionDetailsFromReport: function(exceptionReport) {
        var exceptionDetails = [];
        if (DOMParser) {
            var parser = new DOMParser();
            try {
                var xml = parser.parseFromString(exceptionReport, 'text/xml');
                var exceptions = Ext.DomQuery.select('ServiceException', xml);
                Ext.each(exceptions, function(exception) {
                    exceptionDetails.push(exception.innerHTML);
                });
            } catch (e) {
                // pass
                Ext.Logger.warn('Failed to parse responseText as XML: ' + e);
            }
        }
        return exceptionDetails;
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
     * @param {string[]} allCrs a list of all available coordinate systems
     *  up to this level
     * @return {ol.layer.Tile} The created layer or `undefined`.
     */
    getOlLayer: function(capLayer, version, mapProj, url, allCrs) {
        // This really should not matter, as ol can reproject in the client
        // At least it should be configurable
        if (version === '1.3.0' &&
            !Ext.Array.contains(allCrs, mapProj)) {
            // only available for 1.3.0
            return;
        }
        var style = capLayer.Style;
        var olSource = new ol.source.TileWMS({
            url: url,
            params: {
                LAYERS: capLayer.Name,
                STYLES: style ? style[0].Name : '',
                VERSION: version,
                TRANSPARENT: true
            }
        });

        var legendUrl = null;

        if (Ext.isArray(style) && !Ext.isEmpty(style) &&
            Ext.isArray(style[0].LegendURL) &&
            !Ext.isEmpty(style[0].LegendURL) &&
            style[0].LegendURL[0].OnlineResource) {
            legendUrl = style[0].LegendURL[0].OnlineResource;
        }

        var bbox;
        if (capLayer.BoundingBox) {
            for (var i = 0; i < capLayer.BoundingBox.length; ++i) {
                if (capLayer.BoundingBox[i].crs === 'CRS:84') {
                    bbox = capLayer.BoundingBox[i].extent;
                }
            }
            if (!bbox) {
                for (i = 0; i < capLayer.BoundingBox.length; ++i) {
                    if (capLayer.BoundingBox[i].crs === 'EPSG:4326') {
                        bbox = capLayer.BoundingBox[i].extent;
                    }
                }
            }
            // looks like parsing 1.1.1 capabilities the crs is not
            // set on the bounding box object
            if (!bbox) {
                for (i = 0; i < capLayer.BoundingBox.length; ++i) {
                    bbox = capLayer.BoundingBox[i].extent;
                }
            }
        }

        var olLayer = new ol.layer.Tile({
            topic: true,
            name: capLayer.Title,
            source: olSource,
            legendUrl: legendUrl,
            queryable: capLayer.queryable,
            layerExtent: bbox
        });
        return olLayer;
    },

    /**
     * Recursively collect all available sub layers from
     * the given capabilities layer node.
     *
     * @param {object} layer the capabilities layer node
     * @param {string} version the WMS version
     * @param {string} mapProj the projection
     * @param {string} url the WMS URL
     * @param {ol.Layer[]} compatible the array to collect the layers in
     * @param {string[]} allCrs all coordinate systems found in the hierarchy
     */
    collectLayers: function(layer, version, mapProj, url, compatible, allCrs) {
        var me = this;
        allCrs = allCrs.concat(layer.CRS);
        var olLayer = me.getOlLayer(layer, version, mapProj, url, allCrs);
        if (olLayer) {
            compatible.push(olLayer);
        }

        if (Ext.isArray(layer.Layer)) {
            Ext.each(layer.Layer, function(subLayer) {
                me.collectLayers(
                    subLayer,
                    version,
                    mapProj,
                    url,
                    compatible,
                    allCrs.slice()
                );
            });
        }
    },

    /**
     * Checks if the passed capabilities object (from the #parser) is
     * compatible. It will return an array of layers if we could determine any,
     * and the boolean value `false` if not.
     *
     * @param {Object} capabilities The GetCapabilities object as it is returned
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
        var allCrs = capabilities.Capability.Layer.CRS || [];
        var layers = capabilities.Capability.Layer.Layer;
        var url = capabilities.Capability.Request.GetMap.
            DCPType[0].HTTP.Get.OnlineResource;

        var includeSubLayer = me.getIncludeSubLayer();

        Ext.each(layers, function(layer) {
            var crsList = allCrs.concat(layer.CRS);
            var olLayer = me.getOlLayer(layer, version, mapProj, url, crsList);
            if (olLayer) {
                compatible.push(olLayer);
            }

            if (includeSubLayer && Ext.isArray(layer.Layer)) {
                Ext.each(layer.Layer, function(subLayer) {
                    me.collectLayers(
                        subLayer,
                        version,
                        mapProj,
                        url,
                        compatible,
                        crsList
                    );
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
