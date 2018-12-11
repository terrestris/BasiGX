Ext.Loader.syncRequire(['BasiGX.view.form.Permalink']);

describe('BasiGX.view.form.Permalink', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.Permalink).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.Permalink');
            expect(inst).to.be.a(BasiGX.view.form.Permalink);
            // teardown
            inst.destroy();
        });
    });
});
