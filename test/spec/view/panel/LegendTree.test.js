Ext.Loader.syncRequire(['BasiGX.view.panel.LegendTree']);

describe('BasiGX.view.panel.LegendTree', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.LegendTree).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.panel.LegendTree');
            expect(inst).to.be.a(BasiGX.view.panel.LegendTree);
            // teardown
            inst.destroy();
        });
    });
});
