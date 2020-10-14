Ext.Loader.syncRequire(['BasiGX.util.Layer']);

describe('BasiGX.util.Layer', function() {

    var layer;
    var layer2;
    var namedLayer;
    var map;
    var testObjs;

    layer = new ol.layer.Base({
        humpty: 'dumpty',
        testProperty: 'ok'
    });
    layer2 = new ol.layer.Base({
        humpty: 'peter',
        testProperty: 'ok'
    });
    namedLayer = new ol.layer.Base({
        name: 'Some layername'
    });
    testObjs = TestUtil.setupTestObjects({
        mapOpts: {
            layers: [layer, namedLayer]
        }
    });
    map = testObjs.map;

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
            // This one was just now added
            var got2 = BasiGX.util.Layer.getLayerBy('foo', 'bar');
            expect(got2).to.be(added);
        });
        it('works with a layer collection', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerBy(
                'humpty', 'dumpty', map.getLayers()
            );
            expect(got1).to.be(layer);

            var added = addLayerWithKeyVal('foo_col', 'bar_col');
            // This one was just now added
            var got2 = BasiGX.util.Layer.getLayerBy(
                'foo_col', 'bar_col', map.getLayers()
            );
            expect(got2).to.be(added);
        });
        it('works with a layer array', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerBy(
                'humpty', 'dumpty', map.getLayers().getArray()
            );
            expect(got1).to.be(layer);

            var added = addLayerWithKeyVal('foo_arr', 'bar_arr');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerBy(
                'foo_arr', 'bar_arr', map.getLayers().getArray()
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

            var added = addLayerWithKeyVal('foo_plain', 'bar_plain');
            arr.push(added);
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerBy(
                'foo_plain', 'bar_plain', arr
            );
            expect(got2).to.be(added);
        });
        it('returns `undefined` if not found', function() {
            var got = BasiGX.util.Layer.getLayerBy('foo_undef', 'bar_undef');
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

            var added = addNamedLayer('foo_named');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerByName('foo_named',
                map.getLayers());
            expect(got2).to.be(added);
        });
        it('works with a layer array', function() {
            // This one was there from the start:
            var got1 = BasiGX.util.Layer.getLayerByName(
                'Some layername', map.getLayers().getArray()
            );
            expect(got1).to.be(namedLayer);

            var added = addNamedLayer('foo_array');
            // This on was just now added
            var got2 = BasiGX.util.Layer.getLayerByName(
                'foo_array', map.getLayers().getArray()
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

            var added = addNamedLayer('foo_plain');
            arr.push(added);
            // This one was just now added
            var got2 = BasiGX.util.Layer.getLayerByName('foo_plain', arr);
            expect(got2).to.be(added);
        });
        it('returns `undefined` if not found', function() {
            var got = BasiGX.util.Layer.getLayerByName('not existing');
            expect(got).to.be(undefined);
        });
    });

    describe('#getLayersBy', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.getLayersBy).to.be.a(Function);
        });
        it('returns empty array if no key is provided', function() {
            var got = BasiGX.util.Layer.getLayersBy();
            expect(got).to.be.empty();
        });
        it('works without the optional collection', function() {
            var got = BasiGX.util.Layer.getLayersBy('humpty', 'dumpty');
            expect(got).to.be.an('array');
            expect(got).to.have.length(1);
            expect(got[0]).to.be(layer);
        });
        it('works with a layer collection', function() {
            var got = BasiGX.util.Layer.getLayersBy('humpty', 'dumpty',
                map.getLayers()
            );
            expect(got).to.be.an('array');
            expect(got).to.have.length(1);
            expect(got[0]).to.be(layer);
        });
        it('works with a layer array', function() {
            var got = BasiGX.util.Layer.getLayersBy('humpty', 'dumpty',
                map.getLayers().getArray()
            );
            expect(got).to.be.an('array');
            expect(got).to.have.length(1);
            expect(got[0]).to.be(layer);
        });
        it('works recursively', function() {
            var layerGroup = new ol.layer.Group({
                layers: [layer2]
            });
            map.addLayer(layerGroup);

            var got = BasiGX.util.Layer.getLayersBy('testProperty', 'ok');
            expect(got).to.be.an('array');
            expect(got).to.have.length(2);
            expect(got[0]).to.be(layer);
            expect(got[1]).to.be(layer2);
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

    describe('#getLayerByLayersParam', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.getLayerByLayersParam).to.be.a(Function);
        });

        var makeTileLayer = function(params) {
            return new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: '',
                    params: params
                })
            });
        };
        var makeImageLayer = function(params) {
            return new ol.layer.Image({
                source: new ol.source.ImageWMS({
                    url: '',
                    params: params
                })
            });
        };
        var tileLayer1 = makeTileLayer({LAYERS: 'abc:def-1'});
        var tileLayer2 = makeTileLayer({layers: 'abc:def-2'});
        var tileLayer3 = makeTileLayer({LaYErS: 'abc:def-3'}); // casing crazy
        var tileLayer4 = makeTileLayer({LAYERS: 'abc:def-4'});
        var tileLayer5 = makeTileLayer({layers: 'abc:def-5'});
        var tileLayer6 = makeTileLayer({layERS: 'abc:def-6'}); // casing crazy

        var imageLayer1 = makeImageLayer({LAYERS: 'uvw:xyz-1'});
        var imageLayer2 = makeImageLayer({layers: 'uvw:xyz-2'});
        var imageLayer3 = makeImageLayer({LayeRS: 'uvw:xyz-3'}); // casing crazy
        var imageLayer4 = makeImageLayer({LAYERS: 'uvw:xyz-4'});
        var imageLayer5 = makeImageLayer({layers: 'uvw:xyz-5'});
        var imageLayer6 = makeImageLayer({lAyErs: 'uvw:xyz-6'}); // casing crazy

        var deepgroup = new ol.layer.Group({
            layers: [
                new ol.layer.Group({
                    layers: [
                        tileLayer4, tileLayer5, tileLayer6,
                        imageLayer4, imageLayer5, imageLayer6
                    ]
                })
            ]
        });
        var m = new ol.Map({
            layers: [
                tileLayer1, tileLayer2, tileLayer3,
                imageLayer1, imageLayer2, imageLayer3,
                deepgroup
            ]
        });

        it('returns undefined if not found', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('piep:matz', m);
            expect(got).to.be(undefined);
        });

        it('finds a tilelayer (param casing: LAYERS)', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('abc:def-1', m);
            expect(got).to.be(tileLayer1);
        });

        it('finds a tilelayer (param casing: layers)', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('abc:def-2', m);
            expect(got).to.be(tileLayer2);
        });

        it('finds a tilelayer (param casing: crazy)', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('abc:def-3', m);
            expect(got).to.be(tileLayer3);
        });

        it('finds an imagelayer (param casing: LAYERS)', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('uvw:xyz-1', m);
            expect(got).to.be(imageLayer1);
        });

        it('finds an imagelayer (param casing: layers)', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('uvw:xyz-2', m);
            expect(got).to.be(imageLayer2);
        });

        it('finds an imagelayer (param casing: crazy)', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('uvw:xyz-3', m);
            expect(got).to.be(imageLayer3);
        });

        it('finds a tilelayer (param casing: LAYERS) in a group', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('abc:def-4', m);
            expect(got).to.be(tileLayer4);
        });

        it('finds a tilelayer (param casing: layers) in a group', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('abc:def-5', m);
            expect(got).to.be(tileLayer5);
        });

        it('finds a tilelayer (param casing: crazy) in a group', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('abc:def-6', m);
            expect(got).to.be(tileLayer6);
        });

        it('finds an imagelayer (param casing: LAYERS) in a group', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('uvw:xyz-4', m);
            expect(got).to.be(imageLayer4);
        });

        it('finds an imagelayer (param casing: layers) in a group', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('uvw:xyz-5', m);
            expect(got).to.be(imageLayer5);
        });

        it('finds an imagelayer (param casing: crazy) in a group', function() {
            var got = BasiGX.util.Layer.getLayerByLayersParam('uvw:xyz-6', m);
            expect(got).to.be(imageLayer6);
        });
    });

    describe('#cascadeLayers', function() {
        it('is a defined function', function() {
            expect(BasiGX.util.Layer.cascadeLayers).to.be.a(Function);
        });

        var tileLayer = new ol.layer.Image();
        var imageLayer = new ol.layer.Image();
        var vectorLayer = new ol.layer.Vector();

        var nestedGroup = new ol.layer.Group({
            layers: [
                new ol.layer.Group({
                    layers: [
                        tileLayer, imageLayer,
                        new ol.layer.Group({
                            layers: [vectorLayer]
                        })
                    ]
                })
            ]
        });

        var cnt = 0;
        BasiGX.util.Layer.cascadeLayers(nestedGroup, function(lyr) {
            lyr.set('foo', 'bar');
            cnt++;
        });

        it('executes given function for every layer', function() {
            expect(cnt).to.be(5);
        });
        it('allows to modify layers / layer groups', function() {
            expect(tileLayer.get('foo')).to.be('bar');
            expect(imageLayer.get('foo')).to.be('bar');
            expect(vectorLayer.get('foo')).to.be('bar');
        });
    });

    after(function() {
        TestUtil.teardownTestObjects(testObjs);
    });
});
