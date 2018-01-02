Ext.Loader.syncRequire(['BasiGX.view.combo.ScaleCombo']);

describe('BasiGX.view.combo.ScaleCombo', function() {
    var map;
    var combo;
    var testObjs;
    beforeEach(function() {
        testObjs = TestUtil.setupTestObjects({
            mapOpts: {
                view: new ol.View({
                    resolution: 7
                })
            }
        });
        map = testObjs.map;
        combo = Ext.create('BasiGX.view.combo.ScaleCombo', {
            map: map
        });
    });
    afterEach(function() {
        combo.destroy();
        TestUtil.teardownTestObjects(testObjs);
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.combo.ScaleCombo).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            expect(combo).to.be.a(BasiGX.view.combo.ScaleCombo);
        });
    });
    describe('autodetects map if not set', function() {
        it('works on an autodetected map if none configured', function() {
            var combo2 = Ext.create('BasiGX.view.combo.ScaleCombo');
            expect(combo2.map).to.be(testObjs.map);
            combo2.destroy();
        });
    });
    describe('defaults', function() {
        it('has some default scales', function() {
            expect(combo.getScales()).to.not.be(undefined);
            expect(combo.getScales()).to.be.an(Array);
        });
    });
    describe('initially selected value', function() {
        it('is taken from the map', function() {
            expect(combo.getValue()).to.be(map.getView().getResolution());
        });
        it('is taken from map even if not existing in store', function() {
            map.setView(new ol.View({resolution: 4711}));
            var combo2 = Ext.create('BasiGX.view.combo.ScaleCombo', {
                map: map,
                scales: [
                    {scale: '1:2.000.000', resolution: 560}
                ]
            });
            expect(combo2.getValue()).to.be(4711);
        });
    });
    describe('two-way binding', function() {
        it('reacts on a map view change', function(done) {
            map.getView().setResolution(815);
            window.setTimeout(function() {
                expect(combo.getValue()).to.be(815);
                done();
            }, 100);
        });
        it('updates map view on selection', function() {
            var oldRes = map.getView().getResolution();
            var rec = combo.store.getAt(0);
            var newRes = rec.get('resolution');
            expect(oldRes).to.not.be(newRes);
            combo.select(rec);
            // see e.g. http://stackoverflow.com/a/14253100
            // or http://stackoverflow.com/a/18112701
            combo.fireEvent('select', combo, rec);
            expect(map.getView().getResolution(), newRes);
        });
    });
});
