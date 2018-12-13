Ext.Loader.syncRequire(['BasiGX.view.grid.FeaturePropertyGrid']);

describe('BasiGX.view.grid.FeaturePropertyGrid', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.grid.FeaturePropertyGrid).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var cfg = {
                olFeature: new ol.Feature()
            };
            var inst = Ext.create('BasiGX.view.grid.FeaturePropertyGrid', cfg);
            expect(inst).to.be.a(BasiGX.view.grid.FeaturePropertyGrid);
            // teardown
            inst.destroy();
        });
    });
});
