Ext.Loader.syncRequire(['BasiGX.view.button.DigitizeModifyObject']);

describe('BasiGX.view.button.DigitizeModifyObject', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.DigitizeModifyObject).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.button.DigitizeModifyObject');
            expect(inst).to.be.a(BasiGX.view.button.DigitizeModifyObject);
            // teardown
            inst.destroy();
        });
    });
});
