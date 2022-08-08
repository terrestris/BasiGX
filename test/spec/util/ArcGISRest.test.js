Ext.Loader.syncRequire(['BasiGX.util.ArcGISRest']);

describe('BasiGX.util.ArcGISRest', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.ArcGISRest).to.not.be(undefined);
        });
    });

    describe('#isArcGISRestUrl', function() {

        it('returns true, if url is ArcGISRest url', function() {
            var url = 'http://example.com/services';
            var result = BasiGX.util.ArcGISRest.isArcGISRestUrl(url);
            expect(result).to.be(true);
        });

        it('returns false, if url is not ArcGISRest url', function() {
            var url = 'http://example.com/foo';
            var result = BasiGX.util.ArcGISRest.isArcGISRestUrl(url);
            expect(result).to.be(false);
        });
    });

    describe('#getArcGISRestRootUrl', function() {

        it('returns the original url, if url is root url', function() {
            var url = 'http://example.com/services';
            var result = BasiGX.util.ArcGISRest.getArcGISRestRootUrl(url);
            expect(result).to.equal(url);
        });

        it('returns the root url, if url is folder url', function() {
            var rootUrl = 'http://example.com/services';
            var url = rootUrl + '/someFolder/MapServer';
            var result = BasiGX.util.ArcGISRest.getArcGISRestRootUrl(url);
            expect(result).to.equal(rootUrl);
        });

        it('returns undefined, if url is not ArcGISRest url', function() {
            var url = 'http://example.com/foo/bar';
            var result = BasiGX.util.ArcGISRest.getArcGISRestRootUrl(url);
            expect(result).to.be(undefined);
        });
    });
});
