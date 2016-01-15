Ext.define('BasiGX.util.CSRF', {

    statics: {
        /**
        * Get the CSRF token value.
        */
        getValue: function() {
            return Ext.DomQuery.select('meta[name=_csrf]')[0].content;
        },

        /**
        * Get the CSRF token key.
        */
        getKey: function() {
            return Ext.DomQuery.select('meta[name=_csrf_header]')[0].content;
        },

        /**
        * Get the full CSRF token object.
        */
        getHeader: function() {
            var me = this,
                header = {},
                headerName = me.getKey(),
                headerVal = me.getValue();

            header[headerName] = headerVal;

            return header;
        }
    }
});
