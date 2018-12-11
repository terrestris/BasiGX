Ext.Loader.syncRequire(['BasiGX.view.form.CoordinateTransform']);

describe('BasiGX.view.form.CoordinateTransform', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.CoordinateTransform).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.CoordinateTransform', {
                coordinateSystemsToUse: [
                    {code: 'EPSG:4326', name: 'WGS84'}
                ]
            });
            expect(inst).to.be.a(BasiGX.view.form.CoordinateTransform);
            // teardown
            inst.destroy();
        });
    });
});
