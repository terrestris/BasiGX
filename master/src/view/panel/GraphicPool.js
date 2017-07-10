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
 *
 * BasiGX.view.panel.GraphicPool
 *
 * Used to upload, select and delete graphics
 *
 * @class BasiGX.view.panel.GraphicPool
 */
Ext.define('BasiGX.view.panel.GraphicPool', {
    extend: 'Ext.panel.Panel',
    xtype: 'basigx-panel-graphicpool',

    requires: [
        'Ext.form.field.File',

        'BasiGX.view.view.GraphicPool',
        'BasiGX.util.Url',
        'BasiGX.util.CSRF',
        'BasiGX.util.MsgBox'
    ],

    /**
     *
     */
    viewModel: {
        data: {
            delButtonText: 'Delete',
            okBtnText: 'Ok',
            msgBoxNoElementSelectedText: 'No image selected',
            closeBtnText: 'Close',
            chooseImageBtnText: 'Choose',
            uploadBtnText: 'Upload',
            uploadWaitMsg: 'Please wait...',
            uploadErrorText: 'Error on upload, check file type and size',
            msgConfirmDeletionTpl: 'Do you really want to delete this picture?',
            graphicDeleteInfoSuccess: 'Image successfully deleted',
            graphicDeleteInfoError: 'Image deletion failed',
            msgDeletionCancelled: 'Deletion cancelled.'
        }
    },

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
    * Will contain the ImageThumbnailDataView for Pictures, if any.
    *
    * @private
    */
    pictureView: null,

    /**
     *
     */
    config: {
        /**
         * The url objects for images.
         * Can contain url and method property
         */
        backendUrls: {
            pictureList: null,
            pictureSrc: null,
            pictureUpload: null,
            graphicDelete: null
        },

        /**
         * flag that indicates that a csrf-token should be sent to backend
         * interfaces on every ajax / form submit.
         */
        useCsrfToken: false,

        /**
         * the callback function that should be called on ok-button click
         */
        okClickCallbackFn: null,

        /**
         * the callback function that should be called on image deletion
         */
        deleteClickCallbackFn: null,

        /**
         * should we offer a close button? Will close a parent window if
         * one exists
         */
        useCloseButton: true
    },

    /**
    * initializes this component
    */
    initComponent: function() {
        var me = this;

        // UI displaying the user pictures
        me.pictureView = Ext.create('BasiGX.view.view.GraphicPool', {
            title: false,
            backendUrls: me.getBackendUrls()
        });
        var viewModel = me.getViewModel();
        var btnText = viewModel.get('chooseImageBtnText');

        me.items = [me.pictureView];

        // file upload for pictures
        me.formItems = [{
            xtype: 'fileuploadfield',
            name: 'file',
            width: 300,
            allowBlank: false,
            buttonText: btnText
        },
        {
            xtype: 'splitter'
        },
        {
            xtype: 'button',
            formBind: true,
            bind: {
                text: '{uploadBtnText}'
            },
            scope: me,
            handler: me.onUploadButtonClick
        }];

        if (me.getUseCsrfToken()) {
            me.formItems.push({
                xtype: 'hiddenfield',
                name: '_csrf',
                value: BasiGX.util.CSRF.getValue()
            });
        }

        me.fbar = [{
            xtype: 'form',
            border: true,
            bodyStyle: {
                borderRightWidth: 0,
                borderBottomWidth: 0,
                borderLeftWidth: 0
            },
            bodyPadding: 2,
            layout: 'hbox',
            width: '100%',
            items: me.formItems
        }];

        me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: [
                {
                    bind: {
                        text: '{delButtonText}'
                    },
                    scope: me,
                    handler: me.onDelButtonClick
                },
                '->',
                {
                    bind: {
                        text: '{okBtnText}'
                    },
                    scope: me,
                    handler: me.onOkButtonClick
                },
                {
                    bind: {
                        text: '{closeBtnText}'
                    },
                    scope: me,
                    handler: me.onCloseButtonClick,
                    hidden: !me.getUseCloseButton()
                }
            ]
        }];

        me.callParent();
    },

    /**
     *
     */
    onUploadButtonClick: function() {
        var me = this;
        var form = me.down('form').getForm();
        var baseUrl = BasiGX.util.Url.getWebProjectBaseUrl();
        var targetUrl = baseUrl + me.getBackendUrls().pictureUpload.url;

        if (form.isValid() && targetUrl) {
            form.submit({
                url: targetUrl,
                bind: {
                    waitMsg: '{uploadWaitMsg}'
                },
                success: function(fp, response) {
                    if (response.result && response.result.success === true) {
                        me.pictureView.getStore().load();
                    } else {
                        BasiGX.error(me.getViewModel().get('uploadErrorText'));
                    }
                },
                failure: function() {
                    BasiGX.error(me.getViewModel().get('uploadErrorText'));
                }
            });
        }
    },

    /**
     * Sends a deletion request for the passed image record.
     *
     * @param {Ext.data.Model} imageRec The image record.
     */
    sendDeletionRequest: function(imageRec) {
        var me = this;
        var id = imageRec.get('id');
        var token;

        if (me.getUseCsrfToken()) {
            token = BasiGX.util.CSRF.getHeader();
        }
        Ext.Ajax.request({
            url: BasiGX.util.Url.getWebProjectBaseUrl() +
                me.getBackendUrls().graphicDelete.url + id,
            method: me.getBackendUrls().graphicDelete.method || 'POST',
            headers: token,
            success: function(response) {
                if (!Ext.isEmpty(response.responseText)) {
                    var json = Ext.decode(response.responseText);
                    if (json.success) {
                        me.pictureView.getStore().load();
                        BasiGX.info(
                            me.getViewModel().get('graphicDeleteInfoSuccess')
                        );
                    }
                } else if (response.status === 204) {
                    me.pictureView.getStore().load();
                    BasiGX.info(
                        me.getViewModel().get('graphicDeleteInfoSuccess')
                    );
                } else {
                    BasiGX.error(
                        me.getViewModel().get('graphicDeleteInfoError')
                    );
                }
            },
            failure: function() {
                BasiGX.error(
                    me.getViewModel().get('graphicDeleteInfoError')
                );
            }
        });
    },

    /**
     * Returns the Ext.data.Model instance for the selected picture.
     *
     * @return {Ext.data.Model} The selected picture record.
     */
    getSelectedPicture: function() {
        var me = this;
        var sm = me.pictureView.getSelectionModel();
        var selectedPicture = sm.getSelection()[0];
        return selectedPicture;
    },

    /**
     * Informs the user that currently no element is selected.
     */
    infoNoSelection: function() {
        BasiGX.info(this.getViewModel().get('msgBoxNoElementSelectedText'));
    },

    /**
     * Callback for the click event on the OK button. Will eventually execute
     * the #okClickCallbackFn.
     */
    onOkButtonClick: function() {
        var pic = this.getSelectedPicture();
        if (pic) {
            if (Ext.isFunction(this.getOkClickCallbackFn())) {
                var cb = this.getOkClickCallbackFn();
                cb(pic);
            } else {
                Ext.log.warn('Please implement your own callback function');
            }
            if (this.up('window')) {
                this.up('window').close();
            }
        } else {
            this.infoNoSelection();
        }
    },

    /**
     * Callback for the click event on the delete button. Will eventually
     * execute the #deleteClickCallbackFn.
     */
    onDelButtonClick: function() {
        var me = this;
        var pic = me.getSelectedPicture();
        if (pic) {
            BasiGX.confirm(me.getViewModel().get('msgConfirmDeletionTpl'), {
                fn: function(decision) {
                    if (decision === 'yes') {
                        me.sendDeletionRequest(pic);
                        if (Ext.isFunction(me.getDeleteClickCallbackFn())) {
                            var cb = me.getDeleteClickCallbackFn();
                            cb(pic);
                        } else {
                            Ext.log.warn('Please implement your own ' +
                                'delete callback');
                        }
                    } else {
                        BasiGX.info(
                            me.getViewModel().get('msgDeletionCancelled')
                        );
                    }
                }
            });
        } else {
            this.infoNoSelection();
        }
    },

    /**
     * Closes the window where this panel is embedded, if any.
     */
    onCloseButtonClick: function() {
        var me = this;
        if (me.up('window')) {
            me.up('window').close();
        }
    }
});
