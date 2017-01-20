Ext.define('BasiGX.util.CopyClipboard', {

    statics: {

        /**
         *
         */
        copyToClipboardSupported: document.queryCommandSupported('copy'),

        /**
         *
         */
        copyTextToClipboard: function(copyText, cbSuccess, cbFailure, cbScope) {
            var staticMe = BasiGX.util.CopyClipboard;

            if (!staticMe.copyToClipboardSupported) {
                Ext.Logger.warn('Copy to clipboard is not supported ' +
                        'by the browser!');
            }

            var dh = Ext.DomHelper;
            var spec = {
                tag: 'input',
                id: 'hidden-copy-paste-textarea',
                style: 'height:0;'
            };
            var hiddenInputField = dh.append(
                Ext.getBody(),
                spec
            );

            hiddenInputField.value = copyText;
            hiddenInputField.select();

            try {
                var success = document.execCommand('copy');
                if (success) {
                    if (Ext.isFunction(cbSuccess)) {
                        cbSuccess.call(cbScope);
                    }
                } else {
                    if (Ext.isFunction(cbFailure)) {
                        cbFailure.call(cbScope);
                    }
                }
                hiddenInputField.remove();
            } catch (err) {
                if (Ext.isFunction(cbFailure)) {
                    cbFailure.call(cbScope);
                }
                hiddenInputField.remove();
            }
        }
    }

});
