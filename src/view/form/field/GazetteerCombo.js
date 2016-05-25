Ext.define('BasiGX.view.form.field.GazetteerCombo',{
    extend: 'Ext.form.field.ComboBox',

    xtype: 'basigx_form_field_gazetteercombo',

    requires: [
         'BasiGX.util.Map'
    ],

    store: [],

    /**
     * Initializes the gazetteer combo component.
     */
    initComponent: function(){
        var me = this;

        me.callParent(arguments);

        me.on('boxready', me.onBoxReady, me);
        me.on('change', me.onComboValueChange, me);
    },

    /**
     *
     */
    onBoxReady: function(){
        var me = this;
        me.nav = Ext.create('Ext.util.KeyNav', me.el, {
            esc: function(){
                me.clearValue();
            },
            scope: me
        });
    },

    /**
     * @param combo
     * @param newValue
     */
    onComboValueChange: function(combo, newValue){

        var me = this;
        var gazetteerGrid =
            Ext.ComponentQuery.query('basigx_grid_gazetteergrid')[0];

        if(newValue){
            if(gazetteerGrid) {
                gazetteerGrid.show(combo);
            }
            me.doGazetteerSearch(newValue);
        } else {
            if(gazetteerGrid) {
                gazetteerGrid.getEl().slideOut('t', {
                    duration: 250,
                    callback: function(){
                        gazetteerGrid.hide();
                    }
                });
            }
        }
    },

    /**
     * @param value
     */
    doGazetteerSearch: function(value){
        var gazetteerGrid =
            Ext.ComponentQuery.query('basigx_grid_gazetteergrid')[0];
        var gazetteerStore = gazetteerGrid.getStore();
        var checkbox = gazetteerGrid.down('checkbox[name=limitcheckbox]');
        var limitToBBox = checkbox.getValue();

        gazetteerGrid.show();

        Ext.Ajax.abort(gazetteerStore._lastRequest);

        gazetteerStore.getProxy().setExtraParam('q', value);

        if(limitToBBox){
            var map = BasiGX.util.Map.getMapComponent().getMap();
            var olView = map.getView();
            var projection = olView.getProjection().getCode();
            var bbox = map.getView().calculateExtent(map.getSize());
            var transformedBbox = ol.proj.transformExtent(bbox, projection,
                    'EPSG:4326');
            gazetteerStore.getProxy().setExtraParam('viewboxlbrt',
                    transformedBbox.toString());
        } else {
            gazetteerStore.getProxy().setExtraParam('viewboxlbrt', null);
        }
        gazetteerStore.load();
        gazetteerStore._lastRequest = Ext.Ajax.getLatest();
    }
});
