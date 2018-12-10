Ext.Loader.syncRequire(['BasiGX.view.button.DigitizeCopyObject']);

describe('BasiGX.view.button.DigitizeCopyObject', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizeCopyObject).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.DigitizeCopyObject');
            expect(inst).to.be.a(BasiGX.view.button.DigitizeCopyObject);
            // teardown
            inst.destroy();
        });
    });
});
