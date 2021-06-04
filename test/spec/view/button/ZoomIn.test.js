Ext.Loader.syncRequire(['BasiGX.view.button.ZoomIn']);

describe('BasiGX.view.button.ZoomIn', function() {

    var btn;
    var testObjs;
    var map;

    beforeEach(function() {
        testObjs = TestUtil.setupTestObjects({
            mapOpts: {
                view: new ol.View({
                    resolutions: [800, 400, 200, 100, 50],
                    resolution: 100
                })
            }
        });
        map = testObjs.map;
        btn = Ext.create('BasiGX.view.button.ZoomIn', {
            olMap: map,
            toggleGroup: 'tg'
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
            expect(BasiGX.view.button.ZoomIn).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            expect(btn).to.be.a(BasiGX.view.button.ZoomIn);
            // teardown
            btn.destroy();
        });
        it('has some default configs', function() {
            expect(btn.enableZoomInWithBox).to.not.be(undefined);
            expect(btn.animate).to.not.be(undefined);
            expect(btn.dragZoomInInteraction).to.not.be(undefined);
            expect(btn.animationDuration).to.not.be(undefined);
            expect(btn.enableZoomInWithBox).to.be(true);
            expect(btn.animate).to.be(true);
            expect(btn.dragZoomInInteraction).to.be(null);
            expect(typeof btn.animationDuration).to.be('number');
        });
    });

    describe('Handler', function() {
        it('adds ol DragZoom interaction on toggle', function() {
            var intCount = btn.olMap.getInteractions().getArray().length;
            btn.toggle();
            expect(btn.olMap.getInteractions().getArray().length).to.be(intCount + 1);
        });
        it('doesn\'t do anything on click if configured as toggle button', function() {
            var got = btn.click();
            expect(got).to.be(undefined);
        });
        it('calls zoomIn method on click if configured as simple button', function() {
            var btn2 = Ext.create('BasiGX.view.button.ZoomIn', {
                olMap: map
            });
            var spy = sinon.spy(btn2, 'zoomIn');
            btn2.click();
            expect(spy.called).to.be(true);
            btn2.zoomIn.restore();
            btn2.destroy();
        });
    });

    describe('Static methods', function() {
        describe('zoomIn', function() {
            it('halves the ol view resolution on call', function() {
                var view = btn.olMap.getView();
                var oldRes = view.getResolution();
                btn.animate = false;
                btn.zoomIn();
                expect(view.getResolution()).to.be(oldRes / 2);
            });
        });
    });
});
