/* Copyright (c) 2018-present terrestris GmbH & Co. KG
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
 * @class BasiGX.view.window.FileUploadWindow
 */
Ext.define('BasiGX.view.window.FileUploadWindow', {
    extend: 'Ext.window.Window',
    xtype: 'basigx-window-fileupload',
    cls: 'basigx-window-fileupload',

    requires: [
        'Ext.form.field.File'
    ],

    viewModel: {
        data: {
            title: 'Upload file',
            description: 'Please select a file to upload:',
            okButtonLabel: 'Ok',
            cancelButtonLabel: 'Cancel'
        }
    },

    config: {
        /**
         * Callback function that receives the contents of the selected
         * file as string when ok is clicked.
         */
        importHandler: function() {},
        /**
         * Callback function called when cancel is clicked.
         */
        cancelHandler: function() {},
        /**
         * If set to true, (fake) path components will be stripped in the
         * text field.
         */
        hideFakepath: false
    },

    bind: {
        title: '{title}'
    },

    constrainHeader: true,
    collapsible: true,
    height: 140,
    width: 300,
    layout: 'vbox',
    autoShow: true,
    defaults: {
        flex: 1,
        width: '100%'
    },

    items: [{
        xtype: 'form',
        bodyPadding: 10,
        bbar: [{
            xtype: 'button',
            bind: {
                text: '{okButtonLabel}'
            },
            handler: function() {
                var win = this.up('window');
                if (win.down('form').isValid()) {
                    var file = win.el.dom.querySelector('input[type=file]')
                        .files[0];
                    var reader = new FileReader();
                    reader.onload = function() {
                        win.getImportHandler()(this.result);
                        win.close();
                    };
                    // NOTE: could be improved to use the other read functions
                    // if configured, or other text encodings
                    reader.readAsText(file);
                }
            }
        }, {
            xtype: 'button',
            bind: {
                text: '{cancelButtonLabel}'
            },
            handler: function() {
                var win = this.up('window');
                win.getCancelHandler()();
                win.close();
            }
        }],
        items: [{
            xtype: 'label',
            padding: 5,
            bind: {
                text: '{description}'
            }
        }, {
            xtype: 'filefield',
            padding: 5,
            allowBlank: false,
            listeners: {
                change: function(field, path) {
                    if (!this.up('window').getHideFakepath()) {
                        return;
                    }
                    var ms = /[/\\]([^/\\]+)$/.exec(path);
                    if (ms && ms[1]) {
                        field.el.dom.querySelector('input').value = ms[1];
                    }
                }
            }
        }]
    }]

});
