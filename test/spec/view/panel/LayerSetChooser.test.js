Ext.Loader.syncRequire(['BasiGX.view.panel.LayerSetChooser']);

describe('BasiGX.view.panel.LayerSetChooser', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.LayerSetChooser).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.panel.LayerSetChooser');
            expect(inst).to.be.a(BasiGX.view.panel.LayerSetChooser);
            // teardown
            inst.destroy();
        });
    });
});
