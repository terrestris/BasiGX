Ext.Loader.syncRequire(['BasiGX.view.button.CoordinateTransform']);

describe('BasiGX.view.button.CoordinateTransform', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.CoordinateTransform).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.CoordinateTransform');
            expect(btn).to.be.a(BasiGX.view.button.CoordinateTransform);
            // teardown
            btn.destroy();
        });
    });
});
