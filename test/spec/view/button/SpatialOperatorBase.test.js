Ext.Loader.syncRequire(['BasiGX.view.button.SpatialOperatorBase']);

describe('BasiGX.view.button.SpatialOperatorBase', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.SpatialOperatorBase).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.SpatialOperatorBase');
            expect(inst).to.be.a(BasiGX.view.button.SpatialOperatorBase);
            // teardown
            inst.destroy();
        });
    });
});
