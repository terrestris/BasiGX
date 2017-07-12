Ext.require([
    'BasiGX.view.component.Map',
    'BasiGX.util.Animate'
]);

Ext.onReady(function() {

    Ext.create('Ext.container.Container', {
        renderTo: 'map',
        layout: 'border',
        width: '100%',
        height: 600,
        items: [{
            xtype: 'panel',
            region: 'center',
            layout: 'fit',
            items: [{
                xtype: 'basigx-component-map',
                appContextPath: './resources/appContext.json'
            }],
            rbar: [{
                xtype: 'button',
                text: 'Switch to hover mode',
                pressed: false,
                enableToggle: true,
                handler: function(btn) {
                    hoverSelect.setActive(btn.pressed);
                    clickSelect.setActive(!btn.pressed);
                    btn.setText(btn.pressed ? 'Switch to click mode' :
                        'Switch to hover mode');
                }
            }, {
                xtype: 'button',
                text: 'Material Fill',
                pressed: true,
                toggleGroup: 'animation'
            }, {
                xtype: 'button',
                text: 'Flash Feature',
                pressed: false,
                toggleGroup: 'animation'
            }]
        }]
    });

    var map = BasiGX.util.Map.getMapComponent().map;

    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: './resources/geojson.geojson',
            format: new ol.format.GeoJSON()
        })
    });
    map.addLayer(vector);

    var defaultStyle = function(feature, resolution) {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 1,
                color: [51, 153, 204, 1]
            })
        });
    };

    var clickSelect = new ol.interaction.Select({
        style: defaultStyle,
        hitTolerance: 10
    });
    var hoverSelect = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove,
        style: defaultStyle
    });

    map.addInteraction(clickSelect);
    map.addInteraction(hoverSelect);
    hoverSelect.setActive(false);

    clickSelect.on('select', function(e) {
        animateFeature(e);
        // remove selections immediately to allow reselect
        var interactions = map.getInteractions().getArray();
        interactions.forEach(function(i) {
            if (i.getFeatures) {
                i.getFeatures().clear();
            }
        });
    });
    hoverSelect.on('select', function(e) {
        animateFeature(e);
    });

    var animateFeature = function(e) {
        var feature = e.selected[0];
        if (!feature) {
            return;
        }
        var evt = e.mapBrowserEvent;
        var materialFill = Ext.ComponentQuery.query(
            'button[text=Material Fill]')[0].pressed;
        var flashFeature = Ext.ComponentQuery.query(
            'button[text=Flash Feature]')[0].pressed;
        if (materialFill) {
            BasiGX.util.Animate.materialFill(feature, 1000, evt);
        } else if (flashFeature) {
            BasiGX.util.Animate.flashFeature(feature, 1000);
        }
    }
});
