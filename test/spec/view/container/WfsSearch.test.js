Ext.Loader.syncRequire(['BasiGX.view.container.WfsSearch']);

describe('BasiGX.view.container.WfsSearch', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.WfsSearch).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.container.WfsSearch');
            expect(inst).to.be.a(BasiGX.view.container.WfsSearch);
            // teardown
            inst.destroy();
        });
    });
});
