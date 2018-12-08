Ext.Loader.syncRequire(['BasiGX.util.WFS']);

describe('BasiGX.util.WFS', function() {
    var WfsUtil = BasiGX.util.WFS;
    describe('Basics', function() {
        it('is defined', function() {
            expect(WfsUtil).to.not.be(undefined);
        });
    });

    describe('Static methods', function() {

        var map;
        var testObjs;
        beforeEach(function() {
            testObjs = TestUtil.setupTestObjects();
            map = testObjs.map;
        });
        afterEach(function() {
            TestUtil.teardownTestObjects(testObjs);
        });

        describe('#getBboxFilter', function() {
            it('returns combined bbox aand intersects filter', function() {
                var got = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4]
                );
                expect((/ogc:BBOX/).test(got)).to.be(true);
                expect((/\/ogc:BBOX/).test(got)).to.be(true);
                expect((/ogc:Intersects/).test(got)).to.be(true);
                expect((/\/ogc:Intersects/).test(got)).to.be(true);
                expect((/ogc:And/).test(got)).to.be(true);
                expect((/\/ogc:And/).test(got)).to.be(true);
            });

            it('returns only bbox filter, if told so', function() {
                var got = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'bbox'
                );
                expect((/ogc:BBOX/).test(got)).to.be(true);
                expect((/\/ogc:BBOX/).test(got)).to.be(true);
                expect((/ogc:Intersects/).test(got)).to.be(false);
                expect((/\/ogc:Intersects/).test(got)).to.be(false);
                expect((/ogc:And/).test(got)).to.be(false); // no And!
                expect((/\/ogc:And/).test(got)).to.be(false);
            });

            it('returns only intersects filter, if told so', function() {
                var got = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'intersects'
                );
                expect((/ogc:BBOX/).test(got)).to.be(false);
                expect((/\/ogc:BBOX/).test(got)).to.be(false);
                expect((/ogc:Intersects/).test(got)).to.be(true);
                expect((/\/ogc:Intersects/).test(got)).to.be(true);
                expect((/ogc:And/).test(got)).to.be(false); // no And!
                expect((/\/ogc:And/).test(got)).to.be(false);
            });

            it('types are case insensitive', function() {
                var got1 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'intersects'
                );
                var got2 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'intERSecTS'
                );
                var got3 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'INTERSECTS'
                );
                expect(got1).to.be(got2);
                expect(got2).to.be(got3);

                got1 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'bbox'
                );
                got2 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'bBOx'
                );
                got3 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'BBOX'
                );
                expect(got1).to.be(got2);
                expect(got2).to.be(got3);

                got1 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'both'
                );
                got2 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'bOtH'
                );
                got3 = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'BOTH'
                );
                expect(got1).to.be(got2);
                expect(got2).to.be(got3);
            });

            it('defaults has default type both', function() {
                var defaultType = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4]
                );
                var both = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'both'
                );
                expect(defaultType).to.be(both);
            });

            it('unrecognised type falls back toty pe both', function() {
                var unknownType = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'Francisco Scaramanga'
                );
                var both = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4], 'both'
                );
                expect(unknownType).to.be(both);
            });

            it('includes the correct propertyName', function() {
                var got = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4]
                );
                expect((/<ogc:PropertyName>humpty<\/ogc:PropertyName>/g)
                    .test(got)).to.be(true);
            });

            it('includes the correct projection', function() {
                var got = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4]
                );
                expect((/srsName="EPSG:3857"/g).test(got)).to.be(true);
            });

            it('includes the correct extent', function() {
                var got = WfsUtil.getBboxFilter(
                    map, 'humpty', [1, 2, 3, 4]
                );
                expect((/gml:lowerCorner>1 2<\/gml:lowerCorner/g)
                    .test(got)).to.be(true);
                expect((/gml:upperCorner>3 4<\/gml:upperCorner/g)
                    .test(got)).to.be(true);
            });
        });

        describe('#getAttributeLikeFilter', function() {
            it('returns an attribute filter', function() {
                var got = WfsUtil.getAttributeLikeFilter(
                    ['a', 'b'], 'foo'
                );
                expect((/<PropertyIsLike/).test(got)).to.be(true);
                expect(got.match(/<PropertyIsLike/g).length).to.be(2);
                expect((/<\/PropertyIsLike/).test(got)).to.be(true);
                expect(got.match(/<\/PropertyIsLike/g).length).to.be(2);
                expect((/<PropertyName>a<\/PropertyName>/).test(got)).to.be(true);
                expect((/<PropertyName>b<\/PropertyName>/).test(got)).to.be(true);
                expect(got.match(/<Literal>\*foo\*<\/Literal>/g).length).to.be(2);
            });

            it('returns Or-combined filters by default', function() {
                var got = WfsUtil.getAttributeLikeFilter(
                    ['a', 'b'], 'foo'
                );
                expect((/ogc:Or/).test(got)).to.be(true);
                expect((/\/ogc:Or/).test(got)).to.be(true);
                expect((/ogc:And/).test(got)).to.be(false);
                expect((/\/ogc:And/).test(got)).to.be(false);
            });

            it('can be made to combine filters with And', function() {
                var got = WfsUtil.getAttributeLikeFilter(
                    ['a', 'b'], 'foo', 'And'
                );
                expect((/ogc:Or/).test(got)).to.be(false);
                expect((/\/ogc:Or/).test(got)).to.be(false);
                expect((/ogc:And/).test(got)).to.be(true);
                expect((/\/ogc:And/).test(got)).to.be(true);
            });

            it('is case insensitive by default', function() {
                var got = WfsUtil.getAttributeLikeFilter(
                    ['a', 'b'], 'foo'
                );
                expect((/matchCase="false"/).test(got)).to.be(true);
            });

            it('can be made case sensitive', function() {
                var got = WfsUtil.getAttributeLikeFilter(
                    ['a', 'b'], 'foo', 'Or', true
                );
                expect((/matchCase="true"/).test(got)).to.be(true);
            });

            it('uses "ogc" as ogc namespace alias by default', function() {
                var got = WfsUtil.getAttributeLikeFilter(
                    ['a', 'b'], 'foo'
                );
                expect((/ogc:/).test(got)).to.be(true);
            });

            it('can be made to use a different ogc namespace alias', function() {
                var got = WfsUtil.getAttributeLikeFilter(
                    ['a', 'b'], 'foo', 'Or', false, 'bar'
                );
                expect((/bar:/).test(got)).to.be(true);
            });
        });

        describe('#getOgcFromCqlFilter', function() {

            it('can parse >= filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp >= 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse > filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp > 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse = filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp = 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse != filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp != 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse <= filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp <= 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse < filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp < 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse LIKE filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp LiKe 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse IN filters', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp In 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('returns undefined on unexpected operator', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp <=> 7');
                expect(filter).to.be(undefined);
            });

            it('can parse >= filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp>=7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse > filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp>7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse = filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp=7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse != filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp!=7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse <= filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp<=7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse < filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp<7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse LIKE filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('somePropLiKe7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse IN filters without whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('somePropIn7');
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
                var filter = WfsUtil.getOgcFromCqlFilter('   someProp = 7');
                expect(filter).to.not.be(undefined);
                expect(filter).to.be.an('string');
            });
            it('can parse = filters with trailing whitespace', function() {
                var filter = WfsUtil.getOgcFromCqlFilter('someProp = 7   ');
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

});
