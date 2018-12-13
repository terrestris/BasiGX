Ext.Loader.syncRequire(['BasiGX.view.container.NominatimSearch']);

describe('BasiGX.view.container.NominatimSearch', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.NominatimSearch).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.container.NominatimSearch');
            expect(inst).to.be.a(BasiGX.view.container.NominatimSearch);
            // teardown
            inst.destroy();
        });
    });
});
