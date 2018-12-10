Ext.Loader.syncRequire(['BasiGX.view.button.MergeSelection']);

describe('BasiGX.view.button.MergeSelection', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.MergeSelection).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.MergeSelection');
            expect(inst).to.be.a(BasiGX.view.button.MergeSelection);
            // teardown
            inst.destroy();
        });
    });
});
