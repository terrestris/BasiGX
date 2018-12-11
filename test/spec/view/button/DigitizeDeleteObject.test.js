Ext.Loader.syncRequire(['BasiGX.view.button.DigitizeDeleteObject']);

describe('BasiGX.view.button.DigitizeDeleteObject', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizeDeleteObject).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.DigitizeDeleteObject');
            expect(inst).to.be.a(BasiGX.view.button.DigitizeDeleteObject);
            // teardown
            inst.destroy();
        });
    });
});
