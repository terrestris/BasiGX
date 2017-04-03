Ext.require([
    'BasiGX.view.component.Map',
    'BasiGX.view.combo.Language',
    'BasiGX.view.button.ZoomIn',
    'BasiGX.view.button.ZoomOut',
    'BasiGX.view.button.ZoomToExtent',
    'BasiGX.view.button.Measure',
    'BasiGX.view.button.AddWms'
]);

Ext.onReady(function() {

    // enable tooltips
    Ext.tip.QuickTipManager.init();

    Ext.create('Ext.container.Container', {
        renderTo: 'map',
        layout: 'border',
        width: 800,
        height: 600,
        items: [{
            xtype: 'panel',
            region: 'center',
            layout: 'fit',
            items: [{
                xtype: 'basigx-component-map',
                appContextPath: './resources/appContext.json'
            }],
            tbar: [{
                xtype: 'basigx-combo-language',
                config: {
                    defaultLanguage: 'en',
                    languages: [{
                        code: 'de',
                        name: 'DE'
                    }, {
                        code: 'en',
                        name: 'EN'
                    }],
                    appLocaleUrlTpl: './resources/locale/app-locale-{0}.json'
                }
            }],
            rbar: [{
                xtype: 'basigx-button-zoomin'
            }, {
                xtype: 'basigx-button-zoomout'
            }, {
                xtype: 'basigx-button-zoomtoextent'
            }, {
                xtype: 'basigx-button-measure',
                measureType: 'line'
            }, {
                xtype: 'basigx-button-measure',
                measureType: 'polygon'
            }, {
                xtype: 'tbseparator'
            }, {
                xtype: 'basigx-button-addwms'
            }]
        }]
    });

});
