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
 *
 * BasiGX.view.window.GraphicPool
 *
 * Used to upload, select and delete graphics
 *
 * @class BasiGX.view.window.GraphicPool
 */
Ext.define("BasiGX.view.window.GraphicPool", {
    extend: "Ext.window.Window",
    xtype: "basigx-window-graphicpool",

    requires: [
        'Ext.form.field.File',

        'BasiGX.view.view.GraphicPool',
        'BasiGX.util.Url',
        'BasiGX.util.CSRF',
        'BasiGX.util.MsgBox'
    ],

    /**
     * constrain the window
     */
    constrained: true,

    /**
     * a default width for this component
     */
    width: 535,

    /**
     * a default height for this component
     */
    height: 600,

    /**
     * i18n
     */
    title: 'Graphic Pool',
    delButtonText: 'Delete',
    okBtnText: 'Ok',
    msgBoxNoElementSelectedText: 'No image selected',
    closeBtnText: 'Close',
    chooseImageBtnText: 'Choose',
    uploadBtnText: 'Upload',
    uploadWaitMsg: 'Please wait...',
    uploadErrorText: 'Error on upload',
    msgConfirmDeletionTpl: 'Do your really want to delete this picture?',
    graphicDeleteInfoSuccess: 'Image successfully deleted',
    graphicDeleteInfoError: 'Image deletion failed',

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
        deleteClickCallbackFn: null
    },

    /**
    * initializes this component
    */
    initComponent : function() {
        var me = this;

        // UI displaying the user pictures
        me.pictureView = Ext.create('BasiGX.view.view.GraphicPool', {
            title: false,
            backendUrls: me.getBackendUrls()
        });

        me.items = [me.pictureView];

        // file upload for pictures
        me.formItems = [{
            xtype: 'fileuploadfield',
            name: 'file',
            width: 300,
            allowBlank: false,
            buttonText: me.chooseImageBtnText
        },
        {
            xtype: 'splitter'
        },
        {
            xtype: 'button',
            formBind: true,
            text: me.uploadBtnText,
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

        me.fbar = [
            {
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
            }
        ];

        me.bbar = [
            {
                text: me.delButtonText,
                scope: me,
                handler: me.onDelButtonClick
            },
            '->',
            {
                text: me.okBtnText,
                scope: me,
                handler: me.onOkButtonClick
            },
            {
                text: me.closeBtnText,
                scope: me,
                handler: me.close
            }
        ];

        me.callParent();
    },

    /**
     *
     */
    onUploadButtonClick: function() {
        var me = this,
            form = me.down('form').getForm(),
            baseUrl = BasiGX.util.Url.getWebProjectBaseUrl(),
            targetUrl = baseUrl + me.getBackendUrls().pictureUpload.url;

        if(form.isValid() && targetUrl){
            form.submit({
                url: targetUrl,
                waitMsg: me.uploadWaitMsg,
                success: function(fp, response) {
                    if (response.result && response.result.success === true) {
                        me.pictureView.getStore().load();
                    } else {
                        BasiGX.error(me.uploadErrorText);
                    }
                }
            });
        }
    },

    /**
     *
     */
    sendDeletionRequest: function(imageRec){
        var me = this,
            id = imageRec.get('id'),
            token;

        if (me.getUseCsrfToken()) {
            token = BasiGX.util.CSRF.getHeader();
        }
        Ext.Ajax.request({
            url: BasiGX.util.Url.getWebProjectBaseUrl() +
                me.getBackendUrls().graphicDelete.url + id,
            method: me.getBackendUrls().graphicDelete.method || 'POST',
            headers: token,
            success: function(response){
                var json = Ext.decode(response.responseText);
                if (json.success) {
                    me.pictureView.getStore().load();
                    BasiGX.info(me.graphicDeleteInfoSuccess);
                } else {
                    BasiGX.error(me.graphicDeleteInfoError);
                }
            },
            failure: function(){
                BasiGX.error(me.graphicDeleteInfoError);
            }
        });
    },

    /**
     *
     */
    getSelectedPicture: function() {
        var me = this;
        var sm = me.pictureView.getSelectionModel();
        var selectedPicture = sm.getSelection()[0];
        return selectedPicture;
    },

    /**
     *
     */
    infoNoSelection: function (){
        BasiGX.info(this.msgBoxNoElementSelectedText);
    },

    /**
     *
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
            this.close();
        } else {
            this.infoNoSelection();
        }
    },

    /**
     *
     */
    onDelButtonClick: function() {
        var me = this;
        var pic = this.getSelectedPicture();
        if (pic) {
            BasiGX.confirm('Do you really want to delete this picture?', {
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
                        me.close();
                    } else {
                        BasiGX.info("Deletion cancelled.");
                    }
                }
            });
        } else {
            this.infoNoSelection();
        }
    }
});
