Ext.Loader.syncRequire(['BasiGX.util.Projection']);

describe('BasiGX.util.Projection', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Projection).to.not.be(undefined);
        });
        it('can use proj4js', function() {
            expect(proj4).to.not.be(undefined);
        });
    });
});
