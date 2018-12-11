Ext.Loader.syncRequire(['BasiGX.view.form.field.MultiSearchCombo']);

describe('BasiGX.view.form.field.MultiSearchCombo', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.field.MultiSearchCombo).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.field.MultiSearchCombo');
            expect(inst).to.be.a(BasiGX.view.form.field.MultiSearchCombo);
            // teardown
            inst.destroy();
        });
    });
});
