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

    describe('#createFeatureServerUrl', function() {

        it('returns the featureServer url', function() {
            var serviceUrl = 'http://example.com/services';
            var featureServerName = 'foo';
            var url = serviceUrl + '/' + featureServerName + '/FeatureServer';
            var result = BasiGX.util.ArcGISRest.createFeatureServerUrl(
                serviceUrl, featureServerName);
            expect(result).to.equal(url);
        });

        it('returns the featureServer url with a specified format', function() {
            var serviceUrl = 'http://example.com/services';
            var featureServerName = 'foo';
            var format = 'bar';
            var url = serviceUrl + '/' + featureServerName + '/FeatureServer?f=' + format;
            var result = BasiGX.util.ArcGISRest.createFeatureServerUrl(
                serviceUrl, featureServerName, format);
            expect(result).to.equal(url);
        });
    });

    describe('#createFeatureServerQueryUrl', function() {

        it('returns the featureServer query url', function() {
            var serviceUrl = 'http://example.com/services/foo/FeatureServer';
            var layerId = 0;
            var url = serviceUrl + '/' + layerId + '/query?where='+ encodeURIComponent('1=1');
            var result = BasiGX.util.ArcGISRest.createFeatureServerQueryUrl(
                serviceUrl, layerId);
            expect(result).to.equal(url);
        });

        it('returns the featureServer url with a specified format', function() {
            var serviceUrl = 'http://example.com/services/foo/FeatureServer';
            var layerId = 0;
            var format = 'bar';
            var url = serviceUrl + '/' + layerId + '/query' +
                '?f=' + format + '&where=' + encodeURIComponent('1=1');
            var result = BasiGX.util.ArcGISRest.createFeatureServerQueryUrl(
                serviceUrl, layerId, format);
            expect(result).to.equal(url);
        });

        it('returns the featureServer url with a specified filter', function() {
            var serviceUrl = 'http://example.com/services/foo/FeatureServer';
            var layerId = 0;
            var filter = 'foo=bar';
            var url = serviceUrl + '/' + layerId + '/query' +
                '?where=' + encodeURIComponent(filter);
            var result = BasiGX.util.ArcGISRest.createFeatureServerQueryUrl(
                serviceUrl, layerId, undefined, filter);
            expect(result).to.equal(url);
        });

    });

    describe('#createMapServerUrl', function() {

        it('returns the MapServer url when the service in on the root', function() {
            var serviceUrl = 'http://example.com/services';
            var mapServerName = 'foo';
            var url = serviceUrl + '/' + mapServerName + '/MapServer';
            var result = BasiGX.util.ArcGISRest.createMapServerUrl(
                serviceUrl, mapServerName);
            expect(result).to.equal(url);
        });

        it('returns the MapServer url when the service is in a folder', function() {
            var serviceUrl = 'http://example.com/services/folder';
            var mapServerName = 'folder/servername';
            var expectedUrl = 'http://example.com/services/folder/servername/MapServer';
            var result = BasiGX.util.ArcGISRest.createMapServerUrl(
                serviceUrl, mapServerName);
            expect(result).to.equal(expectedUrl);
        });

        it('returns the MapServer url with a specified format', function() {
            var serviceUrl = 'http://example.com/services';
            var featureServerName = 'foo';
            var format = 'bar';
            var url = serviceUrl + '/' + featureServerName + '/MapServer?f=' + format;
            var result = BasiGX.util.ArcGISRest.createMapServerUrl(
                serviceUrl, featureServerName, format);
            expect(result).to.equal(url);
        });
    });
});
