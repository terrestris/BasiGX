Ext.Loader.syncRequire(['BasiGX.view.button.DigitizeOpenStyler']);

describe('BasiGX.view.button.DigitizeOpenStyler', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizeOpenStyler).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.DigitizeOpenStyler');
            expect(inst).to.be.a(BasiGX.view.button.DigitizeOpenStyler);
            // teardown
            inst.destroy();
        });
    });
});
