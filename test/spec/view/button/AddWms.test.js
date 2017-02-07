Ext.Loader.syncRequire(['BasiGX.view.button.AddWms']);

describe('BasiGX.view.button.AddWms', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.AddWms).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.AddWms');
            expect(btn).to.be.a(BasiGX.view.button.AddWms);
            // teardown
            btn.destroy();
        });
    });
});
