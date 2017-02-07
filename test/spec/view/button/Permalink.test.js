Ext.Loader.syncRequire(['BasiGX.view.button.Permalink']);

describe('BasiGX.view.button.Permalink', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.Permalink).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.Permalink');
            expect(btn).to.be.a(BasiGX.view.button.Permalink);
            // teardown
            btn.destroy();
        });
    });
});
