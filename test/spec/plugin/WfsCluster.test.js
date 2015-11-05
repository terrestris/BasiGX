Ext.Loader.syncRequire(['BasiGX.plugin.WfsCluster']);

describe('BasiGX.plugin.WfsCluster', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.plugin.WfsCluster).to.not.be(undefined);
        });
        it('can be instantiated', function(){
            var plugin = Ext.create('BasiGX.plugin.WfsCluster');
            expect(plugin).to.be.a(BasiGX.plugin.WfsCluster);
        });
    });
    describe('Usage as plugin for BasiGX.view.component.Map', function() {
        var plugin;
        var mapComponent;
        var div;
        var clusterLayerConf;
        var layer;
        beforeEach(function() {
            div = document.createElement('div');
            document.body.appendChild(div);
            clusterLayerConf = {
                type: 'WFSCluster',
                layers: 'test',
                url: 'http://test.com'
            };
            mapComponent = Ext.create('BasiGX.view.component.Map', {
                plugins: ['wfscluster'],
                map: new ol.Map({
                    target: div,
                    projection: 'EPSG:3857'
                })
            });
            BasiGX.util.ConfigParser.map = mapComponent.getMap();
            layer = BasiGX.util.ConfigParser.createLayer(clusterLayerConf);
            mapComponent.getMap().addLayer(layer);
            plugin = mapComponent.getPlugin('wfscluster');
        });
        afterEach(function() {
            mapComponent.destroy();
            document.body.removeChild(div);
            div = null;
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
            expect(layer.getStyle()).to.be.a("function");
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

        //TODO: find a way to trigger the moveend event, setCenter wont work
//        it('registers and calls a moveend listener on map', function() {
//            var loadCount = 0;
//
//            plugin.loadClusterFeatures = function() {
//                loadCount++;
//            };
//            plugin.setUpClusterLayers(mapComponent);
//            mapComponent.getMap().getView().setCenter([22,3]);
//            expect(loadCount).to.not.be(0);
//
//        });
    });
});
