Ext.Loader.syncRequire(['BasiGX.view.form.AddWms']);

describe('BasiGX.view.form.AddWms', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.AddWms).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.AddWms');
            expect(inst).to.be.a(BasiGX.view.form.AddWms);
            // teardown
            inst.destroy();
        });
    });
});
