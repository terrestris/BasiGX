Ext.Loader.syncRequire(['BasiGX.util.Object']);

describe('BasiGX.util.Object', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Object).to.not.be(undefined);
        });
    });
    describe('Static methods', function() {
        describe('#getValueSpellingVariants', function() {
            var cls = BasiGX.util.Object;

            it('returns `undefined` when no object passed', function() {
                expect(cls.getValueSpellingVariants()).to.be(undefined);
            });

            it('returns `undefined` when neither commonVariants nor regex passed', function() {
                expect(cls.getValueSpellingVariants({foo: 1})).to.be(undefined);
            });

            it('returns `undefined` when commonVariants wrongly passed', function() {
                expect(cls.getValueSpellingVariants({foo: 1}, 'foo')).to.be(undefined);
            });

            it('returns `undefined` when regex wrongly passed', function() {
                expect(cls.getValueSpellingVariants({foo: 1}, [], 'foo')).to.be(undefined);
            });

            it('returns `undefined` when empty common variants', function() {
                var obj = {FOO: 123, LAYERS: 1};
                var got = cls.getValueSpellingVariants(
                    obj, []
                );
                expect(got).to.be(undefined);
            });

            it('accepts a common variant', function() {
                var obj = {FOO: 123, LAYERS: 1};
                var got = cls.getValueSpellingVariants(obj, ['LAYERS']);
                expect(got).to.be(1);
            });

            it('accepts many common variants', function() {
                var obj = {FOO: 123, LAYERS: 1};
                var got = cls.getValueSpellingVariants(
                    obj, ['layers', 'LAYERS']
                );
                expect(got).to.be(1);
            });

            it('accepts a regular expression', function() {
                var obj = {FOO: 123, LAYERS: 1};
                var got = cls.getValueSpellingVariants(
                    obj, null, /layers/i
                );
                expect(got).to.be(1);
            });

            it('first checks common variants', function() {
                var obj = {FOO: 123, layers: 'nope' , LAYERS: 'aye'};
                var got = cls.getValueSpellingVariants(
                    obj, ['LAYERS'], /layers/i
                );
                expect(got).to.be('aye');
            });

            it('then checks via regular expression', function() {
                var obj = {FOO: 123, layers: 'nope' , LAYERS: 'aye'};
                var got = cls.getValueSpellingVariants(
                    obj, ['LaYeRs'], /LAYERS/
                );
                expect(got).to.be('aye');
            });
        }); // end of '#getValueSpellingVariants'

        describe('#layersFromParams', function() {
            var cls = BasiGX.util.Object;
            it('can be used to get layers in uppercase (LAYERS)', function() {
                var params = {foo: 'bar', LAYERS: 'yay!'};
                var got = cls.layersFromParams(params);
                expect(got).to.be('yay!');
            });
            it('can be used to get layers in lowercase (layers)', function() {
                var params = {foo: 'bar', layers: 'yay!'};
                var got = cls.layersFromParams(params);
                expect(got).to.be('yay!');
            });
            it('can be used to get layers in any casing (e.g. LaYeRs)', function() {
                var params = {foo: 'bar', LaYeRs: 'yay!'};
                var got = cls.layersFromParams(params);
                expect(got).to.be('yay!');
            });
        }); // end of '#layersFromParams'

        describe('#getValue', function() {
            var testObject;
            beforeEach(function() {
                testObject = {
                    firstLevel: true,
                    level: 'first',
                    firstNested: {
                        secondLevel: true,
                        level: 'second'
                    }
                };
            });

            it('does throw on empty getValue call', function() {
                expect(BasiGX.util.Object.getValue).to.throwError();
            });
            it('returns as expected on getValue call', function() {

                var retVal1 = BasiGX.util.Object.getValue('level', testObject);
                expect(retVal1).to.be('first');

                var retVal2 = BasiGX.util.Object.getValue(
                    'firstNested/level', testObject
                );
                expect(retVal2).to.be('second');

                var retVal3 = BasiGX.util.Object.getValue(
                    'secondLevel', testObject
                );
                expect(retVal3).to.be(true);
            });
        }); // end of '#getValue'
    }); // end of 'Static methods'
});
