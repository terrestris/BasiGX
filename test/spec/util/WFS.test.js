Ext.Loader.syncRequire(['BasiGX.util.WFS']);

describe('BasiGX.util.WFS', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.WFS).to.not.be(undefined);
        });
    });

    describe('In depth', function() {
        it('can parse >= filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp >= 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse > filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp > 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse = filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp = 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse != filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp != 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse <= filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp <= 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse < filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp < 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse LIKE filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp LiKe 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse IN filters', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp In 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });

        it('can parse >= filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp>=7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse > filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp>7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse = filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp=7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse != filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp!=7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse <= filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp<=7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse < filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp<7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse LIKE filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('somePropLiKe7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse IN filters without whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('somePropIn7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });

        it('returns undefined on invalid number of parameters', function() {
            var filter = BasiGX.util.WFS
                .getOgcFromCqlFilter('someProp = 6 seven');
            expect(filter).to.not.be.a('string');
            expect(filter).to.be(undefined);
        });
        it('returns undefined on invalid number of parameters', function() {
            var filter = BasiGX.util.WFS
                .getOgcFromCqlFilter('someProp =    ');
            expect(filter).to.not.be.a('string');
            expect(filter).to.be(undefined);
        });

        it('can parse = filters with leading whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('   someProp = 7');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse = filters with trailing whitespace', function() {
            var filter = BasiGX.util.WFS.getOgcFromCqlFilter('someProp = 7   ');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
        it('can parse = filters with lots of whitespace', function() {
            var filter = BasiGX.util.WFS
                .getOgcFromCqlFilter('    someProp= 7     ');
            expect(filter).to.not.be(undefined);
            expect(filter).to.be.an('string');
        });
    });

});
