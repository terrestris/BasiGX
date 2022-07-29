Ext.Loader.syncRequire(['BasiGX.util.Url']);

describe('BasiGX.util.Url', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Url).to.not.be(undefined);
        });
    });

    describe('#setQueryParam', function() {
        it('adds the given query param', function() {
            var url = 'http://example.com';
            var paramKey = 'foo';
            var paramValue = 'bar';
            var newUrl = BasiGX.util.Url.setQueryParam(url, paramKey, paramValue);
            expect(newUrl).to.equal('http://example.com/?foo=bar');
        });
    });
});
