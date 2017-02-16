Ext.Loader.syncRequire([
    'BasiGX.view.window.Accessible'
]);

describe('BasiGX.view.window.Accessible', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.window.Accessible).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var instance = Ext.create('BasiGX.view.window.Accessible');
            expect(instance).to.be.a(BasiGX.view.window.Accessible);
            instance.destroy();
        });
    });

    describe('AccessibleTitle plugin', function() {
        var instance = null;
        var plugin = null;
        beforeEach(function() {
            instance = Ext.create('BasiGX.view.window.Accessible');
            plugin = instance.getPlugin('a11ytitle');
        });
        afterEach(function() {
            instance.destroy();
            instance = null;
            plugin = null;
        });

        it('is configured with a plugin', function() {
            expect(plugin).to.be.a(BasiGX.plugin.AccessibleTitle);
        });
        it('the plugin will add h2 elements', function() {
            expect(plugin.getA11yHeadingLevel()).to.be(2);
        });
    });

});
