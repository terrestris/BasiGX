Ext.Loader.syncRequire(['BasiGX.view.button.ZoomIn']);

describe('BasiGX.view.button.ZoomIn', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.ZoomIn).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.ZoomIn');
            expect(btn).to.be.a(BasiGX.view.button.ZoomIn);
            // teardown
            btn.destroy();
        });
    });
});
