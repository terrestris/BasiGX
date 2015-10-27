Ext.Loader.syncRequire([
    'BasiGX.view.combo.ScaleCombo',
    'GeoExt.component.Map'
]);

describe('BasiGX.view.combo.ScaleCombo', function() {
    var div;
    var map;
    var combo;
    var mapComponent;
    beforeEach(function() {
        div = document.createElement('div');
        document.body.appendChild(div);
        map = new ol.Map({
            target: div,
            view: new ol.View({
                resolution: 7
            })
        });
        mapComponent = Ext.create('GeoExt.component.Map', {
            map: map
        });
        combo = Ext.create('BasiGX.view.combo.ScaleCombo', {
            map: map
        });
    });
    afterEach(function() {
        combo.destroy();
        mapComponent.destroy();
        map.setTarget(null);
        map = null;
        document.body.removeChild(div);
        div = null;
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.combo.ScaleCombo).to.not.be(undefined);
        });
        it('can be instantiated', function(){
            expect(combo).to.be.a(BasiGX.view.combo.ScaleCombo);
        });
    });
    describe('autodetects map if not set', function() {
        it('works on an autodetected map if none configured', function() {
            var combo2 = Ext.create('BasiGX.view.combo.ScaleCombo');
            expect(combo2.map).to.be(map);
            combo2.destroy();
        });
    });
    describe('defaults', function() {
        it('has some default scales', function(){
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
                    {scale: "1:2.000.000", resolution: 560}
                ]
            });
            expect(combo2.getValue()).to.be(4711);
        });
    });
    describe('two-way binding', function() {
        it('reacts on a map view change', function() {
            map.getView().setResolution(815);
            expect(combo.getValue()).to.be(815);
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
