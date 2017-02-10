Ext.Loader.syncRequire(['BasiGX.util.Application']);

describe('BasiGX.util.Application', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Application).to.not.be(undefined);
        });
    });
    describe('Usage of static Methods', function() {
        var mapComponent;
        var testObjs;
        beforeEach(function() {
            testObjs = TestUtil.setupTestObjects();
            mapComponent = testObjs.mapComponent;
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });

        it('does not throw on getAppContext call', function() {
            expect(BasiGX.util.Application.getAppContext).
            to.not.throwException();
        });
        it('returns as expected on getAppContext call', function() {
            var retVal = BasiGX.util.Application.getAppContext();
            expect(retVal).to.be(null);

            mapComponent.appContext = {};
            mapComponent.appContext.data = {};
            mapComponent.appContext.data.merge = {};

            var retVal2 = BasiGX.util.Application.getAppContext();
            expect(retVal2).to.be.an("object");
        });
        it('does not throw on getRoute method call', function() {
            expect(BasiGX.util.Application.getRoute).
                to.not.throwException();
        });
        it('returns route on getRoute method call', function() {
            var retVal = BasiGX.util.Application.getRoute();
            expect(retVal).to.be.a("string");
        });
    });
});
