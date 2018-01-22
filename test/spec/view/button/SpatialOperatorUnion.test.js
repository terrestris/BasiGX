Ext.Loader.syncRequire(['BasiGX.view.button.SpatialOperatorUnion']);
// fixup for methods that invoke `Ext.window.MessageBox` which will lead
// to failing tests
BasiGX.util.MsgBox.error = Ext.emptyFn;

describe('BasiGX.view.button.SpatialOperatorUnion', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.SpatialOperatorUnion).
                to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.SpatialOperatorUnion');
            expect(btn).to.be.a(BasiGX.view.button.SpatialOperatorUnion);
            // teardown
            btn.destroy();
        });
    });
    describe('Error handling', function() {
        it('rejects operation with no features', function() {
            var btn = Ext.create('BasiGX.view.button.SpatialOperatorUnion', {
                targetVectorLayer: new ol.layer.Vector({
                    source: new ol.source.Vector()
                }),
                selectionVectorLayer: new ol.layer.Vector({
                    source: new ol.source.Vector()
                })
            });
            expect(btn.targetVectorLayer.getSource().getFeatures().length).
                to.eql(0);
            btn.doProcess();
            expect(btn.targetVectorLayer.getSource().getFeatures().length).
                to.eql(0);
            btn.destroy();
        });
    });
    describe('Handler', function() {
        it('generates a valid union of two geometries', function() {
            var btn = Ext.create('BasiGX.view.button.SpatialOperatorUnion', {
                targetVectorLayer: new ol.layer.Vector({
                    source: new ol.source.Vector()
                }),
                selectionVectorLayer: new ol.layer.Vector({
                    source: new ol.source.Vector()
                }),
                maxAllowedFeaturesForOperation: 2
            });
            var feature = new ol.Feature({
                geometry: new ol.geom.Polygon(
                    [[[1, 2], [1, 3], [3, 4], [1, 2]]]
                )
            });
            var feature2 = new ol.Feature({
                geometry: new ol.geom.Polygon(
                    [[[4, 5], [4, 6], [6, 7], [4, 5]]]
                )
            });
            btn.getFeatureArray().push(
                feature,
                feature2
            );
            expect(btn.targetVectorLayer.getSource().getFeatures().length).
                to.eql(0);
            btn.doProcess();
            expect(btn.targetVectorLayer.getSource().getFeatures().length).
                to.eql(1);
            btn.destroy();
        });
    });
});
