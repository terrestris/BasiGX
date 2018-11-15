Ext.Loader.syncRequire(['BasiGX.view.MapLoadingStatusBar']);

describe('BasiGX.view.MapLoadingStatusBar', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.MapLoadingStatusBar).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var cmp = Ext.create('BasiGX.view.MapLoadingStatusBar');
            expect(cmp).to.be.a(BasiGX.view.MapLoadingStatusBar);
            // teardown
            cmp.destroy();
        });
    });
});
