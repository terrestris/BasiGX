Ext.Loader.syncRequire(['BasiGX.view.button.DigitizePostit']);

describe('BasiGX.view.button.DigitizePostit', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizePostit).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.DigitizePostit');
            expect(inst).to.be.a(BasiGX.view.button.DigitizePostit);
            // teardown
            inst.destroy();
        });
    });
});
