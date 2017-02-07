Ext.Loader.syncRequire(['BasiGX.view.button.Hsi']);

describe('BasiGX.view.button.Hsi', function() {
    describe('Basics', function() {

        var mapComponent;
        var map;
        var mapDiv;

        beforeEach(function() {
            mapDiv = document.createElement('div');
            document.body.appendChild(mapDiv);

            map = new ol.Map({target: mapDiv});
            mapComponent = Ext.create('BasiGX.view.component.Map', {
                map: map,
                view: new ol.View({
                    resolution: 7
                })
            });
        });

        afterEach(function() {
            map.setTarget(null);
            mapComponent.destroy();
            document.body.removeChild(mapDiv);
            mapDiv = null;
        });

        it('is defined', function() {
            expect(BasiGX.view.button.Hsi).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.Hsi');
            expect(btn).to.be.a(BasiGX.view.button.Hsi);
            // teardown
            btn.destroy();
        });
    });
});
