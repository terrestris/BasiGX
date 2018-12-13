Ext.Loader.syncRequire(['BasiGX.view.panel.MapContainer']);

describe('BasiGX.view.panel.MapContainer', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.MapContainer).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var cfg = {
                mapComponentConfig: {
                    xtype: 'basigx-component-map',
                    appContextPath: '/resources/appContext.json'
                }
            };
            var inst = Ext.create('BasiGX.view.panel.MapContainer', cfg);
            expect(inst).to.be.a(BasiGX.view.panel.MapContainer);
            // teardown
            inst.destroy();
        });
    });
});
