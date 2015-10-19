Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.form.field.Number',
    'Ext.form.field.Date',
    'Ext.tip.QuickTipManager',
    'Ext.form.FieldSet',
    'Ext.layout.container.Form',
    'Ext.form.field.File',
    'Ext.util.CSV'
]);

Ext.define('Task', {
    extend: 'Ext.data.Model',
    idProperty: 'taskId',
    fields: [
        {name: 'column_1', type: 'auto'},
        {name: 'column_2', type: 'auto'},
        {name: 'column_3', type: 'auto'},
        {name: 'column_4', type: 'auto'},
        {name: 'column_5', type: 'auto'},
        {name: 'column_6', type: 'auto'},
        {name: 'column_7', type: 'auto'},
        {name: 'column_8', type: 'auto'}
    ]
});

Ext.onReady(function(){

    Ext.tip.QuickTipManager.init();

    var store = Ext.create('Ext.data.Store', {
        model: 'Task'
    });

    var grid = Ext.create('Ext.grid.Panel', {
        width: '100%',
        height: 800,
        frame: true,
        title: 'Sponsored Projects',
        iconCls: 'icon-grid',
        renderTo: document.body,
        store: store,
        listeners: {
            'afterrender': function(grid){
                grid.down('toolbar').add({
                    xtype: 'button',
                    tooltip: 'Klassenliste importieren',
                    text: 'csv import',
                    scale: 'medium',
                    handler: function() {
                        Ext.create('Ext.window.Window', {
                            title: 'Klassenliste importieren',
                            name: 'csv-import-window',
                            items: [{
                                xtype: 'form-csvimport',
                                grid: grid,
                                associatonObject: {
                                    'id': 'Spalte 1',
                                    'geom': 'Spalte 2',
                                    'start_measure': 'Spalte 5',
                                    'end_measure': 'Spalte 4',
                                    'value': 'Spalte 3',
                                    'medium': 'Spalte 6',
                                    'duration': 'Spalte 7',
                                    'Cs-134': 'Spalte 8'
                                },
                                listeners: {
                                    'importcomplete': function(){
                                        Ext.ComponentQuery.query(
                                            'window[name=csv-import-window]')[0]
                                            .close();
                                    },
                                    scope: this
                                }
                            }]
                        }).show();
                    }
                });
            }
        },
        dockedItems: [{
            dock: 'top',
            xtype: 'toolbar',
            items: []
        }],
        columns: [{
            text: 'Spalte 1',
            flex: 1,
            dataIndex: 'column_1'
        },{
            text: 'Spalte 2',
            flex: 1,
            dataIndex: 'column_2'
        },{
            text: 'Spalte 3',
            flex: 1,
            dataIndex: 'column_3'
        },{
            text: 'Spalte 4',
            flex: 1,
            dataIndex: 'column_4'
        },{
            text: 'Spalte 5',
            flex: 1,
            dataIndex: 'column_5'
        },{
            text: 'Spalte 6',
            flex: 1,
            dataIndex: 'column_6'
        },{
            text: 'Spalte 7',
            flex: 1,
            dataIndex: 'column_7'
        },{
            text: 'Spalte 8',
            flex: 1,
            dataIndex: 'column_8'
        }]
    });
});