Ext.Loader.syncRequire(['BasiGX.view.button.ZoomToExtent']);

describe('BasiGX.view.button.ZoomToExtent', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.ZoomToExtent).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.ZoomToExtent');
            expect(btn).to.be.a(BasiGX.view.button.ZoomToExtent);
            // teardown
            btn.destroy();
        });
    });
});
