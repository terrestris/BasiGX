Ext.Loader.syncRequire(['BasiGX.view.container.RedlineStyler']);

describe('BasiGX.view.container.RedlineStyler', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.RedlineStyler).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.container.RedlineStyler');
            expect(inst).to.be.a(BasiGX.view.container.RedlineStyler);
            // teardown
            inst.destroy();
        });
    });
});
