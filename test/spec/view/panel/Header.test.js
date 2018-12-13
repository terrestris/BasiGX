Ext.Loader.syncRequire(['BasiGX.view.panel.Header']);

describe('BasiGX.view.panel.Header', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.Header).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.panel.Header');
            expect(inst).to.be.a(BasiGX.view.panel.Header);
            // teardown
            inst.destroy();
        });
    });
});
