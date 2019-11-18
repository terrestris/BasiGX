Ext.Loader.syncRequire(['BasiGX.plugin.Hover']);

describe('BasiGX.plugin.Hover', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.plugin.Hover).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var plugin = Ext.create('BasiGX.plugin.Hover');
            expect(plugin).to.be.a(BasiGX.plugin.Hover);
        });
    });

    describe('Static properties', function() {
        describe('they are defined for the base plugin', function() {
            it('works for #HOVER_OVERLAY_IDENTIFIER_KEY', function() {
                var prop = BasiGX.plugin.Hover.HOVER_OVERLAY_IDENTIFIER_KEY;
                expect(prop).to.not.be(undefined);
            });
            it('works for #HOVER_OVERLAY_IDENTIFIER_VALUE', function() {
                var prop = BasiGX.plugin.Hover.HOVER_OVERLAY_IDENTIFIER_VALUE;
                expect(prop).to.not.be(undefined);
            });
            it('works for #LAYER_HOVERABLE_PROPERTY_NAME', function() {
                var prop = BasiGX.plugin.Hover.LAYER_HOVERABLE_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
            });
            it('works for #LAYER_HOVERFIELD_PROPERTY_NAME', function() {
                var prop = BasiGX.plugin.Hover.LAYER_HOVERFIELD_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
            });
        });
        describe('they are inherited for subclasses', function() {
            var ParentClass = BasiGX.plugin.Hover;
            var ExtendedClass = null;
            beforeEach(function() {
                ExtendedClass = Ext.define('TestExtendHover', {
                    extend: 'BasiGX.plugin.Hover',
                    alias: 'plugin.test-extend-hover',
                    pluginId: 'test-hover'
                });
            });
            afterEach(function() {
                Ext.undefine('TestExtendHover');
                ExtendedClass = null;
            });
            it('works for #HOVER_OVERLAY_IDENTIFIER_KEY', function() {
                var originalProp = ParentClass.HOVER_OVERLAY_IDENTIFIER_KEY;
                var prop = ExtendedClass.HOVER_OVERLAY_IDENTIFIER_KEY;
                expect(prop).to.not.be(undefined);
                expect(prop).to.be(originalProp);
            });
            it('works for #HOVER_OVERLAY_IDENTIFIER_VALUE', function() {
                var originalProp = ParentClass.HOVER_OVERLAY_IDENTIFIER_VALUE;
                var prop = ExtendedClass.HOVER_OVERLAY_IDENTIFIER_VALUE;
                expect(prop).to.not.be(undefined);
                expect(prop).to.be(originalProp);
            });
            it('works for #LAYER_HOVERABLE_PROPERTY_NAME', function() {
                var originalProp = ParentClass.LAYER_HOVERABLE_PROPERTY_NAME;
                var prop = ExtendedClass.LAYER_HOVERABLE_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
                expect(prop).to.be(originalProp);
            });
            it('works for #LAYER_HOVERFIELD_PROPERTY_NAME', function() {
                var originalProp = ParentClass.LAYER_HOVERFIELD_PROPERTY_NAME;
                var prop = ExtendedClass.LAYER_HOVERFIELD_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
                expect(prop).to.be(originalProp);
            });
        });
        describe('they can be overridden for subclasses', function() {
            var ParentClass = BasiGX.plugin.Hover;
            var ExtendedClass = null;
            beforeEach(function() {
                ExtendedClass = Ext.define('TestExtendHover', {
                    extend: 'BasiGX.plugin.Hover',
                    alias: 'plugin.test-extend-hover',
                    pluginId: 'test-hover',
                    inheritableStatics: {
                        HOVER_OVERLAY_IDENTIFIER_KEY: 'a',
                        HOVER_OVERLAY_IDENTIFIER_VALUE: 'b',
                        LAYER_HOVERABLE_PROPERTY_NAME: 'c',
                        LAYER_HOVERFIELD_PROPERTY_NAME: 'd'
                    }
                });
            });
            afterEach(function() {
                Ext.undefine('TestExtendHover');
                ExtendedClass = null;
            });
            it('works for #HOVER_OVERLAY_IDENTIFIER_KEY', function() {
                var originalProp = ParentClass.HOVER_OVERLAY_IDENTIFIER_KEY;
                var prop = ExtendedClass.HOVER_OVERLAY_IDENTIFIER_KEY;
                expect(prop).to.not.be(undefined);
                expect(prop).to.not.be(originalProp);
                expect(prop).to.be('a');
            });
            it('works for #HOVER_OVERLAY_IDENTIFIER_VALUE', function() {
                var originalProp = ParentClass.HOVER_OVERLAY_IDENTIFIER_VALUE;
                var prop = ExtendedClass.HOVER_OVERLAY_IDENTIFIER_VALUE;
                expect(prop).to.not.be(undefined);
                expect(prop).to.not.be(originalProp);
                expect(prop).to.be('b');
            });
            it('works for #LAYER_HOVERABLE_PROPERTY_NAME', function() {
                var originalProp = ParentClass.LAYER_HOVERABLE_PROPERTY_NAME;
                var prop = ExtendedClass.LAYER_HOVERABLE_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
                expect(prop).to.not.be(originalProp);
                expect(prop).to.be('c');
            });
            it('works for #LAYER_HOVERFIELD_PROPERTY_NAME', function() {
                var originalProp = ParentClass.LAYER_HOVERFIELD_PROPERTY_NAME;
                var prop = ExtendedClass.LAYER_HOVERFIELD_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
                expect(prop).to.not.be(originalProp);
                expect(prop).to.be('d');
            });
        });
    });

    describe('Usage as plugin for BasiGX.view.component.Map', function() {
        var plugin;
        var mapComponent;
        var testObjs;
        beforeEach(function() {
            testObjs = TestUtil.setupTestObjects({
                mapComponentOpts: {plugins: ['hover']}
            });
            mapComponent = testObjs.mapComponent;
            plugin = mapComponent.getPlugin('hover');
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });
        it('creates an instance by pluginId', function() {
            expect(plugin).to.be.a(BasiGX.plugin.Hover);
        });
        it('sets the component as member in plugin', function() {
            expect(plugin.getCmp()).to.be(mapComponent);
        });
    });

    describe('Configuration options', function() {
        var plugin;
        var mapComponent;
        var testObjs;
        beforeEach(function() {
            testObjs = TestUtil.setupTestObjects({
                mapComponentOpts: {plugins: ['hover']}
            });
            mapComponent = testObjs.mapComponent;
            plugin = mapComponent.getPlugin('hover');
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });

        describe('sane defaults', function() {
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
            it('has a default hoverColor value set', function () {
                expect(plugin.getHoverColor()).to.be('rgba(255, 0, 0, 0.6)');
            });
        });
        describe('defaults are changeable', function() {
            var mapComponentConfigured;
            var pluginConfigured;
            var source;
            var layer;
            var interaction;
            var testObjs2;
            var hoverColor;

            beforeEach(function() {
                source = new ol.source.Vector();
                layer = new ol.layer.Vector();
                interaction = new ol.interaction.Select();
                hoverColor = 'rgba(0, 255, 0, 1)';
                testObjs2 = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        plugins: {
                            ptype: 'hover',
                            pointerRest: false,
                            pointerRestInterval: 4711,
                            pointerRestPixelTolerance: 0,
                            featureInfoEpsg: 'EPSG:1337',
                            hoverVectorLayerSource: source,
                            hoverVectorLayer: layer,
                            hoverColor: hoverColor,
                            hoverVectorLayerInteraction: interaction
                        }
                    }
                });
                mapComponentConfigured = testObjs2.mapComponent;
                pluginConfigured = mapComponentConfigured.getPlugin('hover');
            });
            afterEach(function() {
                TestUtil.teardownTestObjects(testObjs2);
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
            it('has the expected hoverColor', function () {
                expect(pluginConfigured.getHoverColor()).to.be(
                    hoverColor
                );
            });
        });
        describe('Configurable selectEventOrigin', function() {
            it('is \'collection\' by default', function() {
                // test
                expect(plugin.selectEventOrigin).to.be('collection');
            });
            it('can be set to \'interaction\'', function() {
                var testObjs2 = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        plugins: {
                            ptype: 'hover',
                            selectEventOrigin: 'interaction'
                        }
                    }
                });
                var hoverPlugin = testObjs2.mapComponent.getPlugin('hover');

                // test
                expect(hoverPlugin.selectEventOrigin).to.be('interaction');

                // teardown
                TestUtil.teardownTestObjects(testObjs2);
            });
            it('defaults to \'collection\' on unexpected values', function() {
                // setup
                var testObjs2 = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        plugins: {
                            ptype: 'hover',
                            selectEventOrigin: 'humpty-dumpty'
                        }
                    }
                });
                var hoverPlugin = testObjs2.mapComponent.getPlugin('hover');

                // actually uses the default:
                expect(hoverPlugin.selectEventOrigin).to.be('collection');

                // teardown
                TestUtil.teardownTestObjects(testObjs2);
            });
            it('warns with hints (defaulting to \'collection\')', function() {
                // setup
                var loggerSpy = sinon.spy(Ext.log, 'warn');
                var testObjs2 = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        plugins: {
                            ptype: 'hover',
                            selectEventOrigin: 'humpty-dumpty'
                        }
                    }
                });

                // test
                expect(loggerSpy.calledOnce).to.be.ok();
                var warnMessage = loggerSpy.firstCall.args[0];
                expect(/selectEventOrigin/.test(warnMessage)).to.be.ok();
                expect(/collection/.test(warnMessage)).to.be.ok();

                // teardown
                Ext.log.warn.restore();
                TestUtil.teardownTestObjects(testObjs2);
            });
        });
    });

});
