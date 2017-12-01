Ext.Loader.syncRequire(['BasiGX.view.button.DigitizeLine']);

describe('BasiGX.view.button.DigitizeLine', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizeLine).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.DigitizeLine');
            expect(btn).to.be.a(BasiGX.view.button.DigitizeLine);
            // teardown
            btn.destroy();
        });
    });
});
