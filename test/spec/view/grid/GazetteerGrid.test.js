Ext.Loader.syncRequire(['BasiGX.view.grid.GazetteerGrid']);

describe('BasiGX.view.grid.GazetteerGrid', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.grid.GazetteerGrid).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.grid.GazetteerGrid');
            expect(inst).to.be.a(BasiGX.view.grid.GazetteerGrid);
            // teardown
            inst.destroy();
        });
    });
});
