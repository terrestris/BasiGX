Ext.Loader.syncRequire(['BasiGX.view.container.Redlining']);

describe('BasiGX.view.container.Redlining', function() {
    var redliningContainer;
    var testObjs;
    beforeEach(function() {
        testObjs = TestUtil.setupTestObjects();
        redliningContainer = Ext.create('BasiGX.view.container.Redlining');
    });
    afterEach(function() {
        redliningContainer.destroy();
        TestUtil.teardownTestObjects(testObjs);
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.Redlining).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            expect(redliningContainer).to.be.a(BasiGX.view.container.Redlining);
        });
    });
    describe('state interaction', function() {
        it('getState returns a valid state Object', function() {
            var state = redliningContainer.getState();
            expect(state).to.be.an('object');
            expect(state.pointStyle).to.be.an(ol.style.Style);
            expect(state.pointStyle.getImage()).to.be.an(ol.style.Circle);
            expect(state.lineStyle).to.be.an(ol.style.Style);
            expect(state.lineStyle.getStroke()).to.be.an(ol.style.Stroke);
            expect(state.polygonStyle).to.be.an(ol.style.Style);
            expect(state.polygonStyle.getStroke()).to.be.an(ol.style.Stroke);
            expect(state.polygonStyle.getFill()).to.be.an(ol.style.Fill);
            expect(state.styleFunction).to.be.a('function');
            expect(state.features).to.be.an('array');
        });
        it('setState sets the state Object correct', function() {
            var stateBefore = redliningContainer.getState();
            redliningContainer.setState(stateBefore);
            var stateAfter = redliningContainer.getState();
            expect(stateBefore).to.eql(stateAfter);
            var customState = {
                features: [new ol.Feature({foo: 'bar'})],
                pointStyle: new ol.style.Style({image: new ol.style.Circle()}),
                lineStyle: new ol.style.Style({stroke: new ol.style.Stroke()}),
                polygonStyle: new ol.style.Style(
                    {
                        stroke: new ol.style.Stroke(),
                        fill: new ol.style.Fill()
                    }
                ),
                styleFunction: function() {}
            };
            redliningContainer.setState(customState);
            var state = redliningContainer.getState();
            expect(state).to.be.an('object');
            expect(state.pointStyle).to.be(customState.pointStyle);
            expect(state.pointStyle.getImage()).to.be.an(ol.style.Circle);
            expect(state.lineStyle).to.be(customState.lineStyle);
            expect(state.lineStyle.getStroke()).to.be.an(ol.style.Stroke);
            expect(state.polygonStyle).to.be(customState.polygonStyle);
            expect(state.polygonStyle.getStroke()).to.be.an(ol.style.Stroke);
            expect(state.polygonStyle.getFill()).to.be.an(ol.style.Fill);
            expect(state.styleFunction).to.be.a('function');
            expect(state.features).to.be.an('array');
            expect(state.features.length).to.eql(customState.features.length);
            expect(state.features[0].get('foo')).to.eql('bar');
        });
    });
});
