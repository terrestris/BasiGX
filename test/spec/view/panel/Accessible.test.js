Ext.Loader.syncRequire([
    'BasiGX.view.panel.Accessible'
]);

describe('BasiGX.view.panel.Accessible', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.Accessible).to.not.be(undefined);
        });
        it('can be instantiated', function(){
            var instance = Ext.create('BasiGX.view.panel.Accessible');
            expect(instance).to.be.a(BasiGX.view.panel.Accessible);
            instance.destroy();
        });
    });

    describe('AccessibleTitle plugin', function() {
        var instance = null;
        var plugin = null;
        beforeEach(function() {
            instance = Ext.create('BasiGX.view.panel.Accessible');
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
        it('the plugin will add h3 elements', function() {
            expect(plugin.getA11yHeadingLevel()).to.be(3);
        });
    });

});
