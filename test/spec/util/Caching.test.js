Ext.Loader.syncRequire(['BasiGX.util.Caching']);

describe('BasiGX.util.Caching', function() {
    // ----------------------
    // Basic setup
    // ----------------------

    // set up a custom project for OpenLayers
    var utmProj = new ol.proj.Projection({
        code: 'EPSG:25832',
        extent: [-1878007.03, 3932282.86, 831544.53, 9437501.55],
        units: 'm'
    });
    ol.proj.addProjection(utmProj);

    var testObjs;
    var origExtLogger;
    beforeEach(function() {
        testObjs = TestUtil.setupTestObjects();
        origExtLogger = Ext.Logger;
        // turn off logging during these tests
        Ext.Logger = {info: Ext.emptyFn, warn: Ext.emptyFn};
    });
    afterEach(function() {
        TestUtil.teardownTestObjects(testObjs);
        // restore old logging behaviour
        Ext.Logger = origExtLogger;
    });

    var clazz = BasiGX.util.Caching;

    // ----------------------
    // Tests
    // ----------------------
    describe('Basics', function() {
        it('is defined', function() {
            expect(clazz).to.not.be(undefined);
        });
    });

    describe('Static methods', function() {

        describe('#getGeoWebCacheConfig', function() {
            it('is a defined function', function() {
                expect(clazz.getGeoWebCacheConfig).to.be.a('function');
            });
            it('can be called without parameters', function() {
                expect(clazz.getGeoWebCacheConfig).to.not.throwException();
            });
            it('returns a valid cfg, guessing everything', function() {
                var view = testObjs.map.getView();
                var extent = view.getProjection().getExtent();
                var got = clazz.getGeoWebCacheConfig(); // no params passed
                expect(got.projection).to.be(view.getProjection().getCode());
                expect(got.resolutions).to.eql(view.getResolutions());
                expect(got.maxResolution).to.eql(view.getMaxResolution());
                expect(got.extent).to.eql(extent);
                expect(got.tileOrigin).to.eql([extent[0], extent[3]]);
            });
            it('returns a valid cfg, explicitly passing stuff', function() {
                var view = testObjs.map.getView();
                var tileSize = [256, 256];
                var extent = view.getProjection().getExtent();
                // explictly pass them
                var got = clazz.getGeoWebCacheConfig(view, tileSize, extent);
                expect(got.projection).to.be(view.getProjection().getCode());
                expect(got.resolutions).to.eql(view.getResolutions());
                expect(got.maxResolution).to.eql(view.getMaxResolution());
                expect(got.extent).to.eql(extent);
                expect(got.tileOrigin).to.eql([extent[0], extent[3]]);
            });
            it('returns a valid cfg, tileSize as number', function() {
                var view = testObjs.map.getView();
                var tileSize = 256; // a single number
                var extent = view.getProjection().getExtent();
                var got = clazz.getGeoWebCacheConfig(view, tileSize, extent);
                expect(got.projection).to.be(view.getProjection().getCode());
                expect(got.resolutions).to.eql(view.getResolutions());
                expect(got.maxResolution).to.eql(view.getMaxResolution());
                expect(got.extent).to.eql(extent);
                expect(got.tileOrigin).to.eql([extent[0], extent[3]]);
            });
            it('returns a valid cfg, for alternative tilesizes', function() {
                var view = testObjs.map.getView();
                var tileSize = [512, 128]; // irregular tile
                var extent = view.getProjection().getExtent();
                var got = clazz.getGeoWebCacheConfig(view, tileSize, extent);
                expect(got.projection).to.be(view.getProjection().getCode());
                expect(got.resolutions).to.eql(view.getResolutions());
                expect(got.maxResolution).to.eql(view.getMaxResolution());
                expect(got.extent).to.eql(extent);
                expect(got.tileOrigin).to.eql([extent[0], extent[3]]);
            });
            it('returns a valid cfg, for alternative extents', function() {
                var view = testObjs.map.getView();
                var tileSize = [128, 128]; // reduce so that tiles fit in extent
                // This extent needs to be cloned or at least the map extent cannot be directly
                // modified. Otherwise, we will be modifying the map extent directly,
                // afecting other tests. This is how OL6 works
                var extent = view.getProjection().getExtent();
                // only a quarter of the world for this test
                var quarterOfTheWorldExtent = [extent[0], extent[1], 0, 0] ;
                var got = clazz.getGeoWebCacheConfig(view, tileSize, quarterOfTheWorldExtent);
                expect(got.projection).to.be(view.getProjection().getCode());
                expect(got.resolutions).to.eql(view.getResolutions());
                expect(got.maxResolution).to.eql(view.getMaxResolution());
                expect(got.extent).to.eql(quarterOfTheWorldExtent);
                expect(got.tileOrigin).to.eql(
                    [quarterOfTheWorldExtent[0], quarterOfTheWorldExtent[3]]
                );
            });
            it('works for real world values, EPSG:25832', function() {
                var view = new ol.View({
                    projection: 'EPSG:25832',
                    resolutions: [
                        1120.002240004, 560.0011200022, 280.0005600011,
                        140.0002800006, 70.0001400003, 28.0000560001,
                        14.0000280001, 7.000014, 2.8000056, 1.4000028,
                        0.7000014, 0.28000056, 0.14000028
                    ]
                });
                var tileSize = [256, 256];
                var extent = [237000, 5207000, 960000, 6150000];
                var got = clazz.getGeoWebCacheConfig(view, tileSize, extent);
                // From GWC preview page
                var expectedOrigin = [237000, 6353882.293764096];
                expect(got.projection).to.be(view.getProjection().getCode());
                expect(got.resolutions).to.eql(view.getResolutions());
                expect(got.maxResolution).to.eql(view.getMaxResolution());
                expect(got.extent).to.eql(extent);
                expect(got.tileOrigin).to.eql(expectedOrigin);
            });

            it('works for real world values, EPSG:4326', function() {
                var view = new ol.View({
                    projection: 'EPSG:4326',
                    resolutions: [
                        0.010072426874075599, 0.0050362134370377995,
                        0.0025181067185188998, 0.0012590533592594499,
                        0.0006295266796297249, 0.00025181067185189,
                        0.000125905335925945, 0.0000629526679629725,
                        0.000025181067185188997, 0.000012590533592594498,
                        0.000006295266796297249, 0.0000025181067185188997,
                        0.0000012590533592594498
                    ]
                });
                var tileSize = [256, 256];
                var extent = [
                    5.542797987676652, 46.96430005289825,
                    16.248509129820956, 55.28072087437724
                ];
                var got = clazz.getGeoWebCacheConfig(view, tileSize, extent);
                // From GWC preview page
                var expectedOrigin = [5.542797987676652, 57.278465171951666];
                expect(got.projection).to.be(view.getProjection().getCode());
                expect(got.resolutions).to.eql(view.getResolutions());
                expect(got.maxResolution).to.eql(view.getMaxResolution());
                expect(got.extent).to.eql(extent);
                expect(got.tileOrigin).to.eql(expectedOrigin);
            });
        });

        describe('#getExtentOfCoveringTileGrid', function() {
            it('is a defined function', function() {
                expect(clazz.getExtentOfCoveringTileGrid).to.be.a('function');
            });
            it('can be called without parameters', function() {
                expect(clazz.getExtentOfCoveringTileGrid)
                    .to.not.throwException();
            });
            it('works for real world values, EPSG:25832', function() {
                var maxResolution = 1120.002240004;
                var tileSize = [256, 256];
                var extent = [237000, 5207000, 960000, 6150000];

                // Derived from GWC preview page
                var expectedExtent = [
                    237000, 5207000,
                    1097161.720323072, 6353882.293764096
                ];

                var got = clazz.getExtentOfCoveringTileGrid(
                    tileSize, maxResolution, extent
                );

                expect(got).to.eql(expectedExtent);
                expect(
                    ol.extent.containsExtent(expectedExtent, extent)
                ).to.be.ok();
            });

            it('works for real world values, EPSG:4326', function() {
                var maxResolution = 0.010072426874075599;
                var tileSize = [256, 256];
                var extent = [
                    5.542797987676652, 46.96430005289825,
                    16.248509129820956, 55.28072087437724
                ];

                // Derived from GWC preview page
                var expectedExtent = [
                    5.542797987676652, 46.96430005289825,
                    18.43550438649342, 57.278465171951666
                ];

                var got = clazz.getExtentOfCoveringTileGrid(
                    tileSize, maxResolution, extent
                );

                expect(got).to.eql(expectedExtent);
                expect(
                    ol.extent.containsExtent(expectedExtent, extent)
                ).to.be.ok();
            });

            it('works for irregular tilesizes', function() {
                var maxResolution = 1120.002240004;
                var tileSize = [123, 456];
                var extent = [237000, 5207000, 960000, 6150000];

                var expectedExtent = [
                    237000, 5207000,
                    1063561.653122952, 6228442.042883648
                ];

                var got = clazz.getExtentOfCoveringTileGrid(
                    tileSize, maxResolution, extent
                );

                expect(got).to.eql(expectedExtent);
                expect(
                    ol.extent.containsExtent(expectedExtent, extent)
                ).to.be.ok();
            });
        });

        describe('#getTileOrigin', function() {
            it('is a defined function', function() {
                expect(clazz.getTileOrigin).to.be.a('function');
            });
            it('can be called without parameters', function() {
                expect(clazz.getTileOrigin).to.not.throwException();
            });
            it('works for real world values, EPSG:25832', function() {
                var maxResolution = 1120.002240004;
                var tileSize = [256, 256];
                var extent = [237000, 5207000, 960000, 6150000];

                // Derived from GWC preview page
                var expectedOrigin = [237000, 6353882.293764096];

                var got = clazz.getTileOrigin(
                    tileSize, maxResolution, extent
                );

                expect(got).to.eql(expectedOrigin);
            });

            it('works for real world values, EPSG:4326', function() {
                var maxResolution = 0.010072426874075599;
                var tileSize = [256, 256];
                var extent = [
                    5.542797987676652, 46.96430005289825,
                    16.248509129820956, 55.28072087437724
                ];

                // Derived from GWC preview page
                var expectedOrigin = [5.542797987676652, 57.278465171951666];

                var got = clazz.getTileOrigin(
                    tileSize, maxResolution, extent
                );

                expect(got).to.eql(expectedOrigin);
            });
        });
    });
});
