Ext.Loader.syncRequire(['BasiGX.view.panel.Menu']);

describe('BasiGX.view.panel.Menu', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.Menu).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.panel.Menu');
            expect(inst).to.be.a(BasiGX.view.panel.Menu);
            // teardown
            inst.destroy();
        });
    });
});
