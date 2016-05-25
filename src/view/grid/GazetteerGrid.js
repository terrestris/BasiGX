Ext.define('BasiGX.view.grid.GazetteerGrid',{
    extend: 'Ext.grid.Panel',

    xtype: 'basigx_grid_gazetteergrid',

    requires: [
        'BasiGX.store.GazetteerSearch',
        'BasiGX.util.Map',
        'BasiGX.util.Layer',
        'BasiGX.util.Animate'
    ],

    store: {
        type: 'basigx-gazetteersearch'
    },

    viewModel: {
        data: {
            title: 'Gazetteer',
            hideToolTooltip: 'Hide Gazetteer',
            limitCboxLabel: 'Limit to current map extent',
            refreshBtnTooltip: 'Refresh',
            directionBtnTooltip: 'Directions'
        }
    },

    bind: {
        title: '{title}'
    },

    tools:[{
        type:'minimize',
        bind: {
            tooltip: '{hideToolTooltip}'
        },
        handler: function(e, target, gridheader){
            var grid = gridheader.up('grid');
            grid.getEl().slideOut('t', {
                duration: 250,
                callback: function(){
                    grid.hide();
                }
            });
        }
    }],

    width: 500,

    maxHeight: 400,

    hidden: true,

    tbar: [{
        xtype: 'checkbox',
        name: 'limitcheckbox',
        checked: true,
        bind: {
            boxLabel: '{limitCboxLabel}'
        }
    },
    {
        xtype: 'button',
        name: 'refreshsearchbutton',
        bind: {
            tooltip: '{refreshBtnTooltip}'
        },
        iconCls: 'fa fa-refresh fa-2x'
    },
    '->',
    {
        xtype: 'button',
        name: 'directionsbutton',
        bind: {
            tooltip: '{directionBtnTooltip}'
        },
        iconCls: 'fa fa-question fa-2x'
    }
    ],

    style: {
        right: "75px",
        top: "10px"
    },

    config: {
        layer: null,

        map: null
    },

    columns: {
        items: [{
            text: '',
            xtype: 'templatecolumn',
            width: 40,
            tpl: '<img src="{icon}" height="16" width="16">'
        }, {
            text: 'Name',
            xtype: 'templatecolumn',
            tpl: '<div data-qtip="{display_name}">'+
                        '{display_name}'+
                '</div>',
            flex: 2
        }, {
            text: 'Class',
            dataIndex: 'class',
            flex: 1
        }, {
            text: 'Type',
            dataIndex: 'type',
            flex: 1
        }]
    },

    initComponent: function () {
        var me = this;

        me.callParent(arguments);

        // set handler for all grid items
        me.down('checkbox[name=limitcheckbox]').on('change', me.refreshSearchResults, me);
        me.down('button[name=refreshsearchbutton]').setHandler(me.refreshSearchResults, me);
        me.down('button[name=directionsbutton]').setHandler(me.showDirections, me);

        // add listeners
        me.on('boxready', me.onBoxReady, me);
        me.on('itemmouseenter', me.onItemMouseEnter, me);
        me.on('itemmouseleave', me.onItemMouseLeave, me);
        me.on('itemclick', me.onItemClick, me);
    },

    /**
     *
     */
    onBoxReady: function(){
        var me = this;
        if(!me.map){
            var map = BasiGX.util.Map.getMapComponent().getMap();
            me.setMap(map);
        }
        if(!me.layer){
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector()
            });
            var displayInLayerSwitcherKey =
                BasiGX.util.Layer.KEY_DISPLAY_IN_LAYERSWITCHER;
            layer.set(displayInLayerSwitcherKey, false);
            me.setLayer(layer);
            me.getMap().addLayer(layer);
        }
    },

    /**
     *
     */
    onItemMouseEnter: function(grid, record){
        var me = this;
        var layer = me.getLayer();
        var projection = me.getMap().getView().getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('geotext');
        var feature = format.readFeature(wkt);
        feature.getGeometry().transform('EPSG:4326', projection);
        layer.getSource().addFeature(feature);
    },

    /**
     *
     */
    onItemMouseLeave: function(){
        var me = this;
        var layer = me.getLayer();
        layer.getSource().clear();
    },

    /**
     *
     */
    onItemClick: function(grid, record){
        var me = this;
        var map = me.getMap();
        var olView = map.getView();
        var projection = olView.getProjection().getCode();
        var format = new ol.format.WKT();
        var wkt = record.get('geotext');
        var feature = format.readFeature(wkt);
        var geom = feature.getGeometry().transform('EPSG:4326', projection);
        olView.fit(geom, map.getSize());
    },

    /**
     *
     */
    refreshSearchResults: function(){
        var gazetteerCombo =
            Ext.ComponentQuery.query('basigx_form_field_gazetteercombo')[0];
        var value = gazetteerCombo.getValue();
        gazetteerCombo.doGazetteerSearch(value);
    },

    /**
     *
     */
    showDirections: function(){
        var win = Ext.ComponentQuery.query(
                'window[name="gazetteerdirections"]')[0];
        if(win){
            if(win.isVisible()){
                BasiGX.util.Animate.shake(win);
            } else {
                win.show();
            }
        } else {
            Ext.create('Ext.window.Window', {
                title: 'Gazetteer Directions',
                name: 'gazetteerdirections',
                height: 200,
                width: 400,
                layout: 'fit',
                bodyPadding: 5,
                html: 'Hover a searchresult to highlight it on the map.<br/>' +
                    'Click an item to zoom to its extent.<br/>' +
                    'Beware that if you unchecked "Limit to current map ' +
                    'extent" searchresults may be out of your scope.'
            }).show();
        }
    }
});
