Ext.Loader.syncRequire(['BasiGX.view.button.DigitizeMoveObject']);

describe('BasiGX.view.button.DigitizeMoveObject', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizeMoveObject).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.DigitizeMoveObject');
            expect(inst).to.be.a(BasiGX.view.button.DigitizeMoveObject);
            // teardown
            inst.destroy();
        });
    });
});
