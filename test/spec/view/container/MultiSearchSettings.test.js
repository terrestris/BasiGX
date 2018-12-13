Ext.Loader.syncRequire(['BasiGX.view.container.MultiSearchSettings']);

describe('BasiGX.view.container.MultiSearchSettings', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.MultiSearchSettings).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.container.MultiSearchSettings');
            expect(inst).to.be.a(BasiGX.view.container.MultiSearchSettings);
            // teardown
            inst.destroy();
        });
    });
});
