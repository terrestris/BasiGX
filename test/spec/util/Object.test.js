Ext.Loader.syncRequire(['BasiGX.util.Object']);

describe('BasiGX.util.Object', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Object).to.not.be(undefined);
        });
    });
    describe('Usage of static Methods', function() {
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
            expect(BasiGX.util.Object.getValue).
            to.throwError();
        });
        it('returns as expected on getValue call', function() {

            var retVal1 = BasiGX.util.Object.getValue('level', testObject);
            expect(retVal1).to.be('first');

            var retVal2 = BasiGX.util.Object.getValue('firstNested/level',
                    testObject);
            expect(retVal2).to.be('second');

            var retVal3 = BasiGX.util.Object.getValue('secondLevel',
                    testObject);
            expect(retVal3).to.be(true);
        });
    });
});
