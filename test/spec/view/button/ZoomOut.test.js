Ext.Loader.syncRequire(['BasiGX.view.button.ZoomOut']);

describe('BasiGX.view.button.ZoomOut', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.ZoomOut).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.ZoomOut');
            expect(btn).to.be.a(BasiGX.view.button.ZoomOut);
            // teardown
            btn.destroy();
        });
    });
});
