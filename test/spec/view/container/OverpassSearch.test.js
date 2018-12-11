Ext.Loader.syncRequire(['BasiGX.view.container.OverpassSearch']);

describe('BasiGX.view.container.OverpassSearch', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.OverpassSearch).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.container.OverpassSearch');
            expect(inst).to.be.a(BasiGX.view.container.OverpassSearch);
            // teardown
            inst.destroy();
        });
    });
});
