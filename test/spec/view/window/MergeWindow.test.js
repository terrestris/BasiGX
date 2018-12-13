Ext.Loader.syncRequire(['BasiGX.view.window.MergeWindow']);

describe('BasiGX.view.window.MergeWindow', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.window.MergeWindow).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var cfg = {
                sourceLayer: new ol.layer.Vector({
                    source: new ol.source.Vector()
                }),
                targetLayer: new ol.layer.Vector({
                    source: new ol.source.Vector()
                })
            };
            var inst = Ext.create('BasiGX.view.window.MergeWindow', cfg);
            expect(inst).to.be.a(BasiGX.view.window.MergeWindow);
            // teardown
            inst.destroy();
        });
    });
});
