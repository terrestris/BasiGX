Ext.Loader.syncRequire(['BasiGX.view.grid.FeatureGrid']);

describe('BasiGX.view.grid.FeatureGrid', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.grid.FeatureGrid).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var testObjs = TestUtil.setupTestObjects();
            var cfg = {
                layer: new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: new ol.Collection()
                    })
                }),
                map: testObjs.mapComponent
            };

            var inst = Ext.create('BasiGX.view.grid.FeatureGrid', cfg);
            expect(inst).to.be.a(BasiGX.view.grid.FeatureGrid);
            // teardown
            inst.destroy();
            TestUtil.teardownTestObjects(testObjs);
        });
    });
});
