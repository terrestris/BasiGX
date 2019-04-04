Ext.Loader.syncRequire(['BasiGX.view.button.ZoomOut']);

describe('BasiGX.view.button.ZoomOut', function() {

    var btn;
    var testObjs;
    var map;

    beforeEach(function() {
        testObjs = TestUtil.setupTestObjects({
            mapOpts: {
                view: new ol.View({
                    resolutions: [50, 100, 200, 400, 800],
                    resolution: 100
                })
            }
        });
        map = testObjs.map;
        btn = Ext.create('BasiGX.view.button.ZoomOut', {
            olMap: map
        });
    });

    afterEach(function() {
        if (btn) {
            btn.destroy();
        }
        TestUtil.teardownTestObjects(testObjs);
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.ZoomOut).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            expect(btn).to.be.a(BasiGX.view.button.ZoomOut);
            // teardown
            btn.destroy();
        });
        it('has some default configs', function() {
            expect(btn.enableZoomOutWithBox).to.not.be(undefined);
            expect(btn.enableAnimation).to.not.be(undefined);
            expect(btn.dragZoomOutInteraction).to.not.be(undefined);
            expect(btn.animationDuration).to.not.be(undefined);
            expect(btn.enableZoomOutWithBox).to.be(false);
            expect(btn.enableAnimation).to.be(true);
            expect(btn.dragZoomOutInteraction).to.be(null);
            expect(typeof btn.animationDuration).to.be('number');
        });
    });

    describe('Handler', function() {
        it('adds ol DragZoom interaction on toggle', function() {
            var intCount = btn.olMap.getInteractions().getArray().length;
            // zoom out with box is not enabled -> no interaction added
            btn.toggle();
            expect(btn.olMap.getInteractions().getArray().length).to.be(intCount);
            btn.enableZoomOutWithBox = true;
            btn.toggle();
            expect(btn.olMap.getInteractions().getArray().length).to.be(intCount + 1);
        });
    });

    describe('Static methods', function() {
        describe('zoomOut', function() {
            it('doubles the ol view resolution on call', function() {
                var view = btn.olMap.getView();
                var oldRes = view.getResolution();
                btn.enableAnimation = false;
                btn.zoomOut();
                expect(view.getResolution()).to.be(oldRes * 2);
            });
        });
    });
});
