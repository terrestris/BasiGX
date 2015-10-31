Ext.Loader.syncRequire(['BasiGX.plugin.Hover', 'BasiGX.view.component.Map']);

describe('BasiGX.plugin.Hover', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.plugin.Hover).to.not.be(undefined);
        });
        it('can be instantiated', function(){
            var plugin = Ext.create('BasiGX.plugin.Hover');
            expect(plugin).to.be.a(BasiGX.plugin.Hover);
        });
    });
    describe('Usage as plugin for BasiGX.view.component.Map', function() {
        var plugin;
        var mapComponent;
        var div;
        beforeEach(function() {
            div = document.createElement('div');
            document.body.appendChild(div);
            mapComponent = Ext.create('BasiGX.view.component.Map', {
                plugins: ['hover'],
                map: new ol.Map({target: div})
            });
            plugin = mapComponent.getPlugin('hover');
        });
        afterEach(function() {
            mapComponent.destroy();
            document.body.removeChild(div);
            div = null;
        });
        it('creates an instance by pluginId', function() {
            expect(plugin).to.be.a(BasiGX.plugin.Hover);
        });
        it('sets the component as member in plugin', function() {
            expect(plugin.getCmp()).to.be(mapComponent);
        });
    });
    describe('Configuration options', function(){
        var div;
        var plugin;
        var mapComponent;
        beforeEach(function() {
            div = document.createElement('div');
            document.body.appendChild(div);
            mapComponent = Ext.create('BasiGX.view.component.Map', {
                plugins: ['hover'],
                map: new ol.Map({target: div})
            });
            plugin = mapComponent.getPlugin('hover');
        });
        afterEach(function() {
            mapComponent.destroy();
            document.body.removeChild(div);
            div = null;
        });

        describe('sane defaults', function(){
            it('has pointerRest set to true', function() {
                expect(plugin.getPointerRest()).to.be(true);
            });
            it('has pointerRestInterval set to 300', function() {
                expect(plugin.getPointerRestInterval()).to.be(300);
            });
            it('has pointerRestPixelTolerance set to 5', function() {
                expect(plugin.getPointerRestPixelTolerance()).to.be(5);
            });
            it('has featureInfoEpsg set to "EPSG:3857"', function() {
                expect(plugin.getFeatureInfoEpsg()).to.be('EPSG:3857');
            });
            it('has a hoverVectorLayerSource', function() {
                expect(plugin.getHoverVectorLayerSource()).to.be.an(
                    ol.source.Vector
                );
            });
            it('has a hoverVectorLayerSource', function() {
                expect(plugin.getHoverVectorLayer()).to.be.an(
                    ol.layer.Vector
                );
            });
            it('has a hoverVectorLayerInteraction', function() {
                expect(plugin.getHoverVectorLayerInteraction()).to.be.an(
                    ol.interaction.Select
                );
            });
        });
        describe('defaults are changeable', function(){
            var mapComponentConfigured;
            var pluginConfigured;
            var source;
            var layer;
            var interaction;
            var div2;

            beforeEach(function() {
                div2 = document.createElement('div');
                document.body.appendChild(div2);
                source = new ol.source.Vector();
                layer = new ol.layer.Vector();
                interaction = new ol.interaction.Select();
                mapComponentConfigured = Ext.create(
                    'BasiGX.view.component.Map', {
                        plugins: {
                            ptype:'hover',
                            pointerRest: false,
                            pointerRestInterval: 4711,
                            pointerRestPixelTolerance: 0,
                            featureInfoEpsg: 'EPSG:1337',
                            hoverVectorLayerSource: source,
                            hoverVectorLayer: layer,
                            hoverVectorLayerInteraction: interaction
                        },
                        map: new ol.Map({target: div2})
                    }
                );
                pluginConfigured = mapComponentConfigured.getPlugin('hover');
            });
            afterEach(function(){
                mapComponentConfigured.destroy();
                document.body.removeChild(div2);
                div2 = null;
            });

            it('has pointerRest set to false', function() {
                expect(pluginConfigured.getPointerRest()).to.be(false);
            });
            it('has pointerRestInterval set to 4711', function() {
                expect(pluginConfigured.getPointerRestInterval()).to.be(4711);
            });
            it('has pointerRestPixelTolerance set to 0', function() {
                expect(
                    pluginConfigured.getPointerRestPixelTolerance()
                ).to.be(0);
            });
            it('has featureInfoEpsg set to "EPSG:1337"', function() {
                expect(
                    pluginConfigured.getFeatureInfoEpsg()
                ).to.be('EPSG:1337');
            });
            it('has the expected hoverVectorLayerSource', function() {
                expect(pluginConfigured.getHoverVectorLayerSource()).to.be(
                    source
                );
            });
            it('has the expected hoverVectorLayerSource', function() {
                expect(pluginConfigured.getHoverVectorLayer()).to.be(
                    layer
                );
            });
            it('has the expected hoverVectorLayerInteraction', function() {
                expect(pluginConfigured.getHoverVectorLayerInteraction()).to.be(
                    interaction
                );
            });
        });
    });
});
