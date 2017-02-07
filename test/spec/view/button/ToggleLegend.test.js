Ext.Loader.syncRequire(['BasiGX.view.button.ToggleLegend']);

describe('BasiGX.view.button.ToggleLegend', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.ToggleLegend).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.ToggleLegend');
            expect(btn).to.be.a(BasiGX.view.button.ToggleLegend);
            // teardown
            btn.destroy();
        });
    });
});
