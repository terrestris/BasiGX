Ext.Loader.syncRequire(['BasiGX.view.container.LayerSlider']);

describe('BasiGX.view.container.LayerSlider', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.LayerSlider).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var cfg = {
                layerNames: ['a', 'b']
            };
            var inst = Ext.create('BasiGX.view.container.LayerSlider', cfg);
            expect(inst).to.be.a(BasiGX.view.container.LayerSlider);
            inst.destroy();
        });
    });
});
