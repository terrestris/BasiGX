Ext.Loader.syncRequire(['BasiGX.view.panel.MobileWindow']);

describe('BasiGX.view.panel.MobileWindow', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.MobileWindow).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.panel.MobileWindow');
            expect(inst).to.be.a(BasiGX.view.panel.MobileWindow);
            // teardown
            inst.destroy();
        });
    });
});
