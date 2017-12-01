Ext.Loader.syncRequire(['BasiGX.view.button.DigitizePoint']);

describe('BasiGX.view.button.DigitizePoint', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizePoint).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.DigitizePoint');
            expect(btn).to.be.a(BasiGX.view.button.DigitizePoint);
            // teardown
            btn.destroy();
        });
    });
});
