Ext.Loader.syncRequire(['BasiGX.view.form.field.GazetteerCombo']);

describe('BasiGX.view.form.field.GazetteerCombo', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.field.GazetteerCombo).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.field.GazetteerCombo');
            expect(inst).to.be.a(BasiGX.view.form.field.GazetteerCombo);
            // teardown
            inst.destroy();
        });
    });
});
