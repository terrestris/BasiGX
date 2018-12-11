Ext.Loader.syncRequire(['BasiGX.view.grid.MultiSearchGazetteerGrid']);

describe('BasiGX.view.grid.MultiSearchGazetteerGrid', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.grid.MultiSearchGazetteerGrid).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.grid.MultiSearchGazetteerGrid');
            expect(inst).to.be.a(BasiGX.view.grid.MultiSearchGazetteerGrid);
            // teardown
            inst.destroy();
        });
    });
});
