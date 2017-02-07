Ext.Loader.syncRequire(['BasiGX.view.button.Help']);

describe('BasiGX.view.button.Help', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.Help).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.Help');
            expect(btn).to.be.a(BasiGX.view.button.Help);
            // teardown
            btn.destroy();
        });
    });
});
