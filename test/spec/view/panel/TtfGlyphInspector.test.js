Ext.Loader.syncRequire(['BasiGX.view.panel.TtfGlyphInspector']);

describe('BasiGX.view.panel.TtfGlyphInspector', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.TtfGlyphInspector).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.panel.TtfGlyphInspector');
            expect(inst).to.be.a(BasiGX.view.panel.TtfGlyphInspector);
            // teardown
            inst.destroy();
        });
    });
});
