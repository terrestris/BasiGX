Ext.Loader.syncRequire(['BasiGX.view.form.Print']);

describe('BasiGX.view.form.Print', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.Print).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.Print');
            expect(inst).to.be.a(BasiGX.view.form.Print);
            // teardown
            inst.destroy();
        });
    });
});
