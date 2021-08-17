/* Copyright (c) 2019-present terrestris GmbH & Co. KG
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
 * CSW FormPanel
 *
 * Used to find OGC services through CSW and add them to the map.
 * Currently only WMS layers are supported
 *
 * @class BasiGX.view.form.CSW
 */
Ext.define('BasiGX.view.form.CSW', {
    extend: 'Ext.form.Panel',
    xtype: 'basigx-form-csw',

    requires: [
        'Ext.app.ViewModel',
        'Ext.button.Button',
        'Ext.form.FieldContainer',
        'Ext.form.FieldSet',
        'Ext.form.field.Text',
        'Ext.form.field.Hidden',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.Anchor',
        'Ext.layout.container.HBox',
        'Ext.toolbar.Toolbar',

        'BasiGX.util.MsgBox',
        'BasiGX.view.form.AddWms'
    ],

    viewModel: {
        data: {
            queryParamsFieldSetTitle: 'CSW Basis URL',
            availableLayesFieldSetTitle: 'Verfügbare CSW Dienste',
            resetBtnText: 'Zurücksetzen',
            cswSearchTextFieldLabel: 'Suchbegriff (optional)',
            requestLayersBtnText: 'Verfügbare CSW-Dienste abfragen',
            errorNoServiceFound: 'Es konnte kein passender Dienst gefunden ' +
              'werden',
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
            documentation: '<h2>CSW hinzufügen</h2>• In diesem Dialog ' +
              'können Sie mit Hilfe einer CSW-URL ' +
              'einen Kartendienst der Karte hinzufügen.'
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
         * With these CSW urls we fill the combobox. If this is empty (default),
         * no combobox will be rendered but a plain textfield.
         */
        cswBaseUrls: [],

        /**
         * Default url for the textfield or combobox.
         */
        defaultUrl: 'https://data.mundialis.de/geonetwork/srv/ger/csw?',

        /**
         * Additional parameters that will be applied to the `Ext.Ajax.request`
         */
        additionalRequestParams: {

            /**
             * Whether we will send the `X-Requested-With` header when fetching
             * the CSW records from the URL. The `X-Requested-With` header is
             * usually added for XHR, but adding it should lead to a preflight
             * request (see https://goo.gl/6JzdUI), which some servers fail.
             *
             * @type {Boolean}
             */
            useDefaultXhrHeader: false,

            /**
             * Whether the request against the CSW servers will contain the
             * ExtJS cache buster (`_dc=123…`) or not. If set to `false`, the
             * param will not be send, if set to `true`, we'll pass it along
             * (ExtJS default behaviour).
             *
             * The name of this parameter is taken from the config option of
             * `Ext.Ajax`, turning the boolean logic around would be even more
             * confusing.
             *
             * Defaults to `true`, e.g. the cache buster will be send along in
             * the GET-request.
             *
             * @type {Boolean}
             */
            disableCaching: true
        },

        /**
         * Optional AJAX proxy URL, which will be added before the 'real'
         * target CSW URL, e.g. '../my-proxy.action?baseUrl='
         * @cfg {String}
         */
        ajaxProxy: null
    },

    /**
     * Keeps track of the viewModel key of the last error (if any).
     *
     * @private
     */
    lastErrorMsgKey: null,

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
                    fieldLabel: '{cswUrlTextFieldLabel}'
                },
                name: 'cswUrl',
                allowBlank: false,
                value: null,
                listeners: {
                    change: function(textfield) {
                        var view = textfield.up('basigx-form-csw');
                        view.resetState();
                    },
                    beforerender: function(textfield) {
                        var view = textfield.up('basigx-form-csw');
                        var countUrls = view.cswBaseUrls.length;
                        if (countUrls !== 0) {
                            textfield.setHidden(true);
                        }
                    }
                }
            }, {
                xtype: 'combobox',
                bind: {
                    fieldLabel: '{cswUrlTextFieldLabel}'
                },
                store: null,
                name: 'cswUrlCombo',
                allowBlank: false,
                value: null,
                listeners: {
                    change: function(combobox) {
                        var view = combobox.up('basigx-form-csw');
                        view.resetState();
                    },
                    beforerender: function(combobox) {
                        var view = combobox.up('basigx-form-csw');
                        var countUrls = view.cswBaseUrls.length;
                        if (countUrls === 0) {
                            combobox.setHidden(true);
                        } else {
                            var urlCsw = view.cswBaseUrls;
                            combobox.setStore(urlCsw);
                        }
                    }
                }
            }, {
                xtype: 'textfield',
                bind: {
                    fieldLabel: '{cswSearchTextFieldLabel}'
                },
                name: 'searchtext',
                allowBlank: false,
                value: null,
                listeners: {
                    change: function(textfield) {
                        var view = textfield.up('basigx-form-csw');
                        view.resetState();
                    },
                    specialkey: function(textfield, evt) {
                        // execute search on ENTER is hit inside the textfield
                        if (evt.getKey() === evt.ENTER) {
                            evt.preventDefault();
                            var view = textfield.up('basigx-form-csw');
                            view.resetState();
                            view.requestGetRecords();
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
            hidden: true,
            padding: 5,
            defaults: {
                anchor: '100%'
            },
            bind: {
                title: '{availableLayesFieldSetTitle}'
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
                var view = btn.up('basigx-form-csw');
                view.getForm().reset();
                view.removeAddLayersComponents();
                view.resetState();
                var defaultValue = view.defaultUrl;
                var combo = view.down('combobox[name=cswUrlCombo]');
                combo.setValue(defaultValue);
                var textfield = view.down('textfield[name=cswUrl]');
                textfield.setValue(defaultValue);
            }
        },
        '->',
        {
            bind: {
                text: '{requestLayersBtnText}'
            },
            name: 'requestLayersBtn',
            handler: function(btn) {
                var view = btn.up('basigx-form-csw');
                view.resetState();
                view.requestGetRecords();
            }
        }
    ],

    /**
     * Initializes the form.
     */
    initComponent: function() {
        var me = this;
        me.callParent();
        var defaultValue = me.defaultUrl;
        var combo = me.down('combobox[name=cswUrlCombo]');
        var textfield = me.down('textfield[name=cswUrl]');
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
        var addWmsForm = me.down('basigx-form-addwms');
        if (addWmsForm) {
            addWmsForm.hide();
        }
        var buttonsContainer = me.down('[name=fs-available-layers]');
        buttonsContainer.hide();
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
     * Will be called with the `get layers` button. Issues a CSW `GetRecords`
     * request, parses the response and will create layer entries for all
     * WMS layers (more support for e.g. WFS to come).
     */
    requestGetRecords: function() {
        var me = this;
        var form = me.getForm();
        var combo = me.down('combo[name=cswUrlCombo]');
        var textfield = me.down('textfield[name=cswUrl]');
        var searchtext = me.down('textfield[name=searchtext]').getValue();
        if (combo.isVisible() && !combo.isValid() ||
            textfield.isVisible() && !textfield.isValid()) {
            return;
        }
        me.setLoading(true);
        me.removeAddLayersComponents();
        var values = form.getValues();
        var url;

        if (me.cswBaseUrls.length === 0) {
            url = values.cswUrl;
        } else {
            url = values.cswUrlCombo;
        }

        // add optional AJAX proxy URL
        if (!Ext.isEmpty(me.ajaxProxy)) {
            url = me.ajaxProxy + url;
        }

        var postBody =
          '<?xml version="1.0" encoding="UTF-8"?>' +
            '<csw:GetRecords xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"' +
            ' service="CSW" version="2.0.2" resultType="results">' +
              '<csw:Query typeNames="csw:Record">' +
                '<csw:ElementSetName>full</csw:ElementSetName>' +
                '<csw:Constraint version="1.1.0">' +
                  '<Filter xmlns="http://www.opengis.net/ogc" ' +
                  'xmlns:gml="http://www.opengis.net/gml">' +
                    '<PropertyIsLike wildCard="%" singleChar="_" ' +
                    'escapeChar="\\">' +
                      '<PropertyName>AnyText</PropertyName>' +
                      '<Literal>%' + searchtext + '%</Literal>' +
                    '</PropertyIsLike>' +
                  '</Filter>' +
                '</csw:Constraint>' +
              '</csw:Query>' +
            '</csw:GetRecords>';

        var options = {
            url: url,
            method: 'POST',
            xmlData: postBody,
            success: me.onGetRecordsSuccess,
            failure: me.onGetRecordsFailure,
            scope: me
        };
        Ext.apply(options, me.getAdditionalRequestParams());
        Ext.Ajax.request(options);
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
     * Called if we could successfully query for the records of a CSW, this
     * method will examine the answer and eventually set up a fieldset for all
     * the layers that we have found in the server's answer.
     *
     * @param {XMLHttpRequest} response The response of the request.
     */
    onGetRecordsSuccess: function(response) {
        var me = this;
        me.lastErrorMsgKey = null;
        // some servers answer with a ServiceExceptionReport. In that case, we
        // have to manually call the failure callback.
        if (me.isServiceExceptionReport(response.responseText)) {
            me.onGetRecordsFailure(response);
            return;
        }

        var viewModel = me.getViewModel();
        try {
            var p = new DOMParser();
            var dom = p.parseFromString(response.responseText, 'text/xml');
            var records = dom.getElementsByTagName('csw:Record');
            var wmsLayers = [];
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                var uri = record.getElementsByTagName('dc:URI')[0];
                if (uri) {
                    var protocol = uri.getAttribute('protocol');
                    if (protocol && protocol.toUpperCase().indexOf(
                        'OGC:WMS') > -1) {
                        var url = uri.innerHTML;
                        var name = uri.getAttribute('name');
                        var title = record.getElementsByTagName('dc:title')[0];
                        if (title) {
                            title = title.innerHTML;
                        }
                        var description = record.getElementsByTagName(
                            'dc:description')[0];
                        if (description) {
                            description = description.innerHTML;
                        }
                        wmsLayers.push({
                            url: url,
                            name: name,
                            title: title,
                            description: description
                        });
                    }
                }
            }
        } catch (ex) {
            BasiGX.warn(viewModel.get('errorCouldntParseResponse'));
            me.setLoading(false);
            return;
        }
        me.setLoading(false);
        if (wmsLayers.length === 0) {
            BasiGX.warn(me.getErrorMessage('errorNoServiceFound'));
        } else {
            me.fillAvailableLayersFieldset(wmsLayers);
        }
    },

    /**
     * Called if we could not successfully query the records of a CSW.
     *
     * @param {XMLHttpRequest} response The response of the request.
     */
    onGetRecordsFailure: function(response) {
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

        me.setLoading(false);
        BasiGX.warn(me.getErrorMessage('errorRequestFailed', errDetails));
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
     * Remove the buttons for layers from previous requests.
     */
    removeAddLayersComponents: function() {
        var me = this;
        var buttonsContainer = me.down('[name=fs-available-layers]');
        buttonsContainer.removeAll();
    },

    /**
     * Updates the avaialable layers fieldset with matching entries.
     *
     * @param {Array} layers The layer objects for which the we shall fill
     *     the fieldset.
     */
    fillAvailableLayersFieldset: function(layers) {
        var me = this;
        me.removeAddLayersComponents();
        var fs = me.down('[name=fs-available-layers]');
        fs.show();
        var buttons = [];
        Ext.each(layers, function(layer) {
            buttons.push({
                xtype: 'button',
                text: layer.title || layer.name,
                layer: layer,
                autoEl: {
                    'tag': 'div',
                    'data-qtip': layer.description
                },
                handler: me.getWmsLayer
            });
        });
        fs.add(buttons);
    },

    /**
     * Handles the button click by setting up the basigx-form-addwms,
     * adding the defaultUrl to it and automatically issue a GetCapabilities
     * request so the user can select a WMS layer.
     * TODO: support different OGC services here, not only WMS
     *
     * @param {Ext.button.Button} btn The button that has been pressed.
     *   It contains the layer information to prepare setup of layers.
     */
    getWmsLayer: function(btn) {
        var form = this.up('form');
        var layer = btn.layer;
        var addWmsForm = form.down('basigx-form-addwms');
        if (!addWmsForm) {
            addWmsForm = Ext.create('BasiGX.view.form.AddWms', {
                defaultUrl: layer.url
            });
            form.add(addWmsForm);
            var toolBar = addWmsForm.down('toolbar[dock=bottom]');
            if (toolBar) {
                toolBar.hide();
            }
        } else {
            addWmsForm.setDefaultUrl(layer.url);
            addWmsForm.down('textfield[name=url]').setValue(layer.url);

        }
        addWmsForm.show();
        addWmsForm.requestGetCapabilities();
    }
});
