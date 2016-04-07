Ext.Loader.syncRequire(['BasiGX.util.Layer']);

describe('BasiGX.util.Layer', function() {

    var div;
    var layer;
    var namedLayer;
    var map;
    var mapComponent;

    beforeEach(function() {
        div = document.createElement('div');
        div.style.position = "absolute";
        div.style.top = "0";
        div.style.left = "-1000px";
        div.style.width = "512px";
        div.style.height = "256px";
        document.body.appendChild(div);

        layer = new ol.layer.Base({
            humpty: 'dumpty'
        });
        namedLayer = new ol.layer.Base({
            name: 'Some layername'
        });

        map = new ol.Map({
            layers: [layer, namedLayer],
            view: new ol.View({
                center: [0, 0],
                zoom: 2
            })
        });

        mapComponent = Ext.create('GeoExt.component.Map', {
            map: map
        });
    });
    afterEach(function() {
        mapComponent.destroy();
        document.body.removeChild(div);
        div = null;
    });

    function addLayerWithKeyVal(key, val) {
        var cfg = {};
        cfg[key] = val;
        var l = new ol.layer.Base(cfg);
        map.addLayer(l);
        return l;
    }
    function addNamedLayer(name) {
        var cfg = {name: name};
        var l = new ol.layer.Base(cfg);
        map.addLayer(l);
        return l;
    }

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Layer).to.not.be(undefined);
        });
    });

    describe('#getLayerBy', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.getLayerBy).to.be.a(Function);
        });
        it('works without the optional collection', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerBy('humpty', 'dumpty');
            expect(got1).to.be(layer);

            var added = addLayerWithKeyVal('foo', 'bar');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerBy('foo', 'bar');
            expect(got2).to.be(added);
        });
        it('works with a layer collection', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerBy(
                'humpty', 'dumpty', map.getLayers()
            );
            expect(got1).to.be(layer);

            var added = addLayerWithKeyVal('foo', 'bar');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerBy(
                'foo', 'bar', map.getLayers()
            );
            expect(got2).to.be(added);
        });
        it('works with a layer array', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerBy(
                'humpty', 'dumpty', map.getLayers().getArray()
            );
            expect(got1).to.be(layer);

            var added = addLayerWithKeyVal('foo', 'bar');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerBy(
                'foo', 'bar', map.getLayers().getArray()
            );
            expect(got2).to.be(added);
        });
        it('works with a plain array', function() {
            // This one was there from the start:
            var arr = [layer];
            var got1 = BasiGX.util.Layer.getLayerBy(
                'humpty', 'dumpty', arr
            );
            expect(got1).to.be(layer);

            var added = addLayerWithKeyVal('foo', 'bar');
            arr.push(added);
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerBy(
                'foo', 'bar', arr
            );
            expect(got2).to.be(added);
        });
        it('returns `undefined` if not found', function() {
            var got = BasiGX.util.Layer.getLayerBy('foo', 'bar');
            expect(got).to.be(undefined);
        });
    });

    describe('#getLayerByName', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.getLayerByName).to.be.a(Function);
        });
        it('works without the optional collection', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerByName('Some layername');
            expect(got1).to.be(namedLayer);

            var added = addNamedLayer('foo');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerByName('foo');
            expect(got2).to.be(added);
        });
        it('works with a layer collection', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerByName(
                'Some layername', map.getLayers()
            );
            expect(got1).to.be(namedLayer);

            var added = addNamedLayer('foo');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerByName('foo', map.getLayers());
            expect(got2).to.be(added);
        });
        it('works with a layer array', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerByName(
                'Some layername', map.getLayers().getArray()
            );
            expect(got1).to.be(namedLayer);

            var added = addNamedLayer('foo');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerByName(
                'foo', map.getLayers().getArray()
            );
            expect(got2).to.be(added);
        });
        it('works with a plain array', function() {
            // This one was there from the start:
            var arr = [namedLayer];
            var got1 = BasiGX.util.Layer.getLayerByName(
                'Some layername', arr
            );
            expect(got1).to.be(namedLayer);

            var added = addNamedLayer('foo');
            arr.push(added);
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerByName('foo', arr);
            expect(got2).to.be(added);
        });
        it('returns `undefined` if not found', function() {
            var got = BasiGX.util.Layer.getLayerByName('not existing');
            expect(got).to.be(undefined);
        });
    });

    describe('#getLayerByFeatureType', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.getLayerByFeatureType).to.be.a(Function);
        });
        // TODO add meaningful tests
    });

    describe('#getAllLayers', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.getAllLayers).to.be.a(Function);
        });
        // TODO add meaningful tests
    });

    describe('#getVisibleLayers', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.getVisibleLayers).to.be.a(Function);
        });
        // TODO add meaningful tests
    });
});
