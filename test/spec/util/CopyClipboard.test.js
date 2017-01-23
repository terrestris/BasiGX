Ext.Loader.syncRequire(['BasiGX.util.CopyClipboard']);

describe('BasiGX.util.CopyClipboard', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.CopyClipboard).to.not.be(undefined);
        });
    });

    describe('Static properties', function() {
        describe('#copyToClipboardSupported', function() {
            it('is defined', function() {
                expect(BasiGX.util.CopyClipboard
                        .copyToClipboardSupported).to.not.be(undefined);
            });

            it('returns a bool', function() {
                expect(BasiGX.util.CopyClipboard
                        .copyToClipboardSupported).to.be.a('boolean');
            });
        });
    });

    describe('Static methods', function() {
        describe('#copyTextToClipboard', function() {
            it('is defined', function() {
                expect(BasiGX.util.CopyClipboard
                    .copyTextToClipboard).to.not.be(undefined);
            });
        });
    });
});
