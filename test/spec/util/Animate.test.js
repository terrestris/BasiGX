Ext.Loader.syncRequire(['BasiGX.util.Animate']);

describe('BasiGX.util.Animate', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Animate).to.not.be(undefined);
        });
    });
    describe('Usage of static Methods', function() {
        var btnDiv;
        var testObjs;
        beforeEach(function() {
            btnDiv = TestUtil.setupTestDiv();
            testObjs = TestUtil.setupTestObjects();
        });
        afterEach(function() {
            TestUtil.teardownTestDiv(btnDiv);
            TestUtil.teardownTestObjects(testObjs);
        });

        it('does not throw on shake method call', function() {
            var component = Ext.create('Ext.button.Button', {renderTo: btnDiv});
            expect(BasiGX.util.Animate.shake).withArgs(component, 100, 100).
                to.not.throwException();
        });
        it('does not throw on flashFeature method call', function() {
            var feat = new ol.Feature({geometry: new ol.geom.Point([10,10])});
            expect(BasiGX.util.Animate.flashFeature).withArgs(feat, 100).
                to.not.throwException();
        });
        it('returns listenerkey on flashFeature method call', function() {
            var feat = new ol.Feature({geometry: new ol.geom.Point([10,10])});
            var retVal = BasiGX.util.Animate.flashFeature(feat, 100);
            expect(retVal).not.to.be(undefined);
        });
    });
});
