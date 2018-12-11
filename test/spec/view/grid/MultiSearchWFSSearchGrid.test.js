Ext.Loader.syncRequire(['BasiGX.view.grid.MultiSearchWFSSearchGrid']);

describe('BasiGX.view.grid.MultiSearchWFSSearchGrid', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.grid.MultiSearchWFSSearchGrid).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.grid.MultiSearchWFSSearchGrid');
            expect(inst).to.be.a(BasiGX.view.grid.MultiSearchWFSSearchGrid);
            // teardown
            inst.destroy();
        });
    });
});
