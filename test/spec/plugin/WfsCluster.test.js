Ext.Loader.syncRequire(['BasiGX.plugin.WfsCluster']);

describe('BasiGX.plugin.WfsCluster', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.plugin.WfsCluster).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var plugin = Ext.create('BasiGX.plugin.WfsCluster');
            expect(plugin).to.be.a(BasiGX.plugin.WfsCluster);
        });
    });
    describe('Usage as plugin for BasiGX.view.component.Map', function() {
        var plugin;
        var mapComponent;
        var clusterLayerConf;
        var layer;
        var testObjs;
        beforeEach(function() {
            testObjs = TestUtil.setupTestObjects({
                mapOpts: {
                    projection: 'EPSG:3857'
                },
                mapComponentOpts: {
                    plugins: ['wfscluster']
                }
            });
            clusterLayerConf = {
                type: 'WFSCluster',
                layers: 'test',
                url: 'http://test.com'
            };
            mapComponent = testObjs.mapComponent;
            BasiGX.util.ConfigParser.map = testObjs.map;
            layer = BasiGX.util.ConfigParser.createLayer(clusterLayerConf);
            testObjs.map.addLayer(layer);
            plugin = mapComponent.getPlugin('wfscluster');
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });
        it('creates an instance by pluginId', function() {
            expect(plugin).to.be.a(BasiGX.plugin.WfsCluster);
        });
        it('sets the component as member in plugin', function() {
            expect(plugin.getCmp()).to.be(mapComponent);
        });
        it('can prepare clusterlayers', function() {
            expect(plugin.setUpClusterLayers).withArgs(mapComponent).
                to.not.throwException();
            expect(plugin.setUpClusterLayers).to.throwException();
        });
        it('sets a defaut cluster style on the layer', function() {
            plugin.setUpClusterLayers(mapComponent);
            expect(layer.getStyle()).to.be.a('function');
            expect(layer.getStyle()).to.eql(plugin.clusterStyleFuntion);
        });
        it('registers and calls a visibilityListener on the layer', function() {

            var loadCount = 0;
            layer.setVisible(false);

            plugin.loadClusterFeatures = function() {
                loadCount++;
            };
            plugin.setUpClusterLayers(mapComponent);
            layer.setVisible(true);
            expect(loadCount).to.not.be(0);
        });

        it('registers and calls a moveend listener on map', function() {
            var loadCount = 0;
            plugin.loadClusterFeatures = function() {
                loadCount++;
            };
            plugin.setUpClusterLayers(mapComponent);
            testObjs.map.dispatchEvent('moveend');
            expect(loadCount).to.not.be(0);
        });
    });
});
