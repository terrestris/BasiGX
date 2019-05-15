Ext.Loader.syncRequire(['BasiGX.view.panel.FontSymbolPool']);

describe('BasiGX.view.panel.FontSymbolPool', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.FontSymbolPool).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var cfg = {
                geoserverFontListUrl: '/resources/font-mockup/fonts.json'
            };
            var inst = Ext.create('BasiGX.view.panel.FontSymbolPool', cfg);
            expect(inst).to.be.a(BasiGX.view.panel.FontSymbolPool);
            // teardown
            inst.destroy();
        });
    });
});
