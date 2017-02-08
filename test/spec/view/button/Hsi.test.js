Ext.Loader.syncRequire(['BasiGX.view.button.Hsi']);

describe('BasiGX.view.button.Hsi', function() {
    describe('Basics', function() {
        var testObjs;
        beforeEach(function() {
            testObjs = TestUtil.setupTestObjects();
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
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
