Ext.Loader.syncRequire(['BasiGX.view.view.LayerSet']);

describe('BasiGX.view.view.LayerSet', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.view.LayerSet).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.view.LayerSet');
            expect(inst).to.be.a(BasiGX.view.view.LayerSet);
            // teardown
            inst.destroy();
        });
    });
});
