Ext.Loader.syncRequire(['BasiGX.view.button.DigitizePolygon']);

describe('BasiGX.view.button.DigitizePolygon', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizePolygon).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.DigitizePolygon');
            expect(btn).to.be.a(BasiGX.view.button.DigitizePolygon);
            // teardown
            btn.destroy();
        });
    });
});
