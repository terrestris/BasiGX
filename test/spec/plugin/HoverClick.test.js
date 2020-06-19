
Ext.Loader.syncRequire(['BasiGX.plugin.HoverClick']);

describe('BasiGX.plugin.HoverClick', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.plugin.HoverClick).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var plugin = Ext.create('BasiGX.plugin.HoverClick');
            expect(plugin).to.be.a(BasiGX.plugin.HoverClick);
        });
    });

    describe('Static properties', function() {
        describe('they are defined for the base plugin', function() {
            it('works for #LAYER_CLICKABLE_PROPERTY_NAME', function () {
                var prop = BasiGX.plugin.HoverClick.LAYER_CLICKABLE_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
            });
        });
        describe('they are inherited for subclasses', function() {
            var ParentClass = BasiGX.plugin.HoverClick;
            var ExtendedClass = null;
            beforeEach(function() {
                ExtendedClass = Ext.define('TestExtendHover', {
                    extend: 'BasiGX.plugin.HoverClick',
                    alias: 'plugin.test-extend-hoverclick',
                    pluginId: 'test-hoverClick'
                });
            });
            afterEach(function() {
                Ext.undefine('TestExtendHover');
                ExtendedClass = null;
            });
            it('works for #LAYER_CLICKABLE_PROPERTY_NAME', function() {
                var originalProp = ParentClass.LAYER_CLICKABLE_PROPERTY_NAME;
                var prop = ExtendedClass.LAYER_CLICKABLE_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
                expect(prop).to.be(originalProp);
            });
        });
        describe('they can be overridden for subclasses', function() {
            var ParentClass = BasiGX.plugin.HoverClick;
            var ExtendedClass = null;
            beforeEach(function() {
                ExtendedClass = Ext.define('TestExtendHover', {
                    extend: 'BasiGX.plugin.HoverClick',
                    alias: 'plugin.test-extend-hoverclick',
                    pluginId: 'test-hoverClick',
                    inheritableStatics: {
                        LAYER_CLICKABLE_PROPERTY_NAME: 'a'
                    }
                });
            });
            afterEach(function() {
                Ext.undefine('TestExtendHover');
                ExtendedClass = null;
            });
            it('works for #LAYER_CLICKABLE_PROPERTY_NAME', function() {
                var originalProp = ParentClass.LAYER_CLICKABLE_PROPERTY_NAME;
                var prop = ExtendedClass.LAYER_CLICKABLE_PROPERTY_NAME;
                expect(prop).to.not.be(undefined);
                expect(prop).to.not.be(originalProp);
                expect(prop).to.be('a');
            });
        });
    });

    describe('Usage as plugin for BasiGX.view.component.Map', function() {
        var plugin;
        var mapComponent;
        var testObjs;
        beforeEach(function() {
            testObjs = TestUtil.setupTestObjects({
                mapComponentOpts: {plugins: ['hoverClick']}
            });
            mapComponent = testObjs.mapComponent;
            plugin = mapComponent.getPlugin('hoverClick');
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });
        it('creates an instance by pluginId', function() {
            expect(plugin).to.be.a(BasiGX.plugin.HoverClick);
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
                mapComponentOpts: {plugins: ['hoverClick']}
            });
            mapComponent = testObjs.mapComponent;
            plugin = mapComponent.getPlugin('hoverClick');
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });

        describe('sane defaults', function() {
            it('has hoverable set to true', function() {
                expect(plugin.getHoverable()).to.be(true);
            });
            it('has clickable set to true', function() {
                expect(plugin.getClickable()).to.be(true);
            });
        });
        describe('defaults are changeable', function() {
            var mapComponentConfigured;
            var pluginConfigured;
            var testObjs2;

            beforeEach(function() {
                testObjs2 = TestUtil.setupTestObjects({
                    mapComponentOpts: {
                        plugins: {
                            ptype: 'hoverClick',
                            hoverable: false,
                            clickable: false
                        }
                    }
                });
                mapComponentConfigured = testObjs2.mapComponent;
                pluginConfigured = mapComponentConfigured.getPlugin('hoverClick');
            });
            afterEach(function() {
                TestUtil.teardownTestObjects(testObjs2);
            });

            it('has hoverable set to false', function() {
                expect(pluginConfigured.getHoverable()).to.be(false);
            });
            it('has clickable set to false', function() {
                expect(pluginConfigured.getClickable()).to.be(false);
            });

        });
    });

});
