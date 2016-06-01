Ext.Loader.syncRequire(['BasiGX.view.container.WMSTimeSlider']);

describe('BasiGX.view.container.WMSTimeSlider', function() {
    var div;
    var map;
    var mapComponent;
    var layer;
    var slider;
    var labelcontainer;
    var timeslider;
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
        layer = new ol.layer.Tile({
            name: 'test',
            source: new ol.source.TileWMS({})
        });
        map.addLayer(layer);
        slider = Ext.create('BasiGX.view.container.WMSTimeSlider', {
            url: 'http://geoserver.mundialis.de/geoserver/timeseries/wms',
            layerNameInWMS: 'soilmoisture',
            layerNameInClient: 'test'
        });
        Ext.each(slider.items.items, function(item) {
            if (item.name === "labelcontainer") {
                labelcontainer = item;
            }
        });
        Ext.each(slider.items.items, function(item) {
            if (item.name === "timeslider") {
                timeslider = item;
            }
        });
    });
    afterEach(function() {
        slider.destroy();
        layer = null;
        map.setTarget(null);
        map = null;
        mapComponent.destroy();
        labelcontainer = null;
        timeslider = null;
        document.body.removeChild(div);
        div = null;
    });
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.WMSTimeSlider).to.not.be(undefined);
        });
        it('can be instantiated', function(){
            expect(slider).to.be.a(BasiGX.view.container.WMSTimeSlider);
        });
    });
    describe('timestamps', function() {
        it('has received timestamps', function(){
            expect(slider.getTimes()).to.not.be(undefined);
            expect(slider.getTimes()).to.be.an(Array);
        });
    });
    describe('getLabels', function() {
        it('has a label container', function(){
            expect(labelcontainer).to.not.be(undefined);
            expect(labelcontainer).to.be.a(Ext.container.Container);
        });
        it('has three label items', function(){
            slider.setLabels();
            expect(labelcontainer.items.items).to.be.an(Array);
            expect(labelcontainer.items.items.length).to.be(3);
        });
        it('contains objects', function(){
            Ext.each(labelcontainer.items.items, function(item) {
                expect(item).to.be.an(Object);
            });
        });
    });
    describe('updateTime', function() {
        it('has a slider container', function(){
            expect(timeslider).to.not.be(undefined);
            expect(timeslider).to.be.a(Ext.slider.Single);
        });
        it('choses the right time', function(){
            slider.updateTime();
            var slidertime = slider.getTimes()[timeslider.getValue()];
            var thumbtime = slider.getTimes()[timeslider.thumbs[0].value];
            var layertime = layer.getSource().getParams().TIME;
            // "2016-04-11T00:00:00.000Z"
            expect(layertime).to.match(
              /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+/);
            expect(slidertime).to.be(layertime);
            expect(layertime).to.be(thumbtime);
        });
    });
});
