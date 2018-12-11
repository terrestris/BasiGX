Ext.Loader.syncRequire(['BasiGX.view.component.Map']);

describe('BasiGX.view.component.Map', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.component.Map).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var map = new ol.Map();
            var inst = Ext.create('BasiGX.view.component.Map', {map: map});
            expect(inst).to.be.a(BasiGX.view.component.Map);
            inst.destroy();
        });
    });
});
