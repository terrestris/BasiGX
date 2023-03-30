Ext.Loader.syncRequire(['BasiGX.util.Projection']);

describe('BasiGX.util.Projection', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Projection).to.not.be(undefined);
        });
        it('can use proj4js', function() {
            expect(proj4).to.not.be(undefined);
        });
        it('can use BasiGX.store.Projections', function() {
            expect(BasiGX.store.Projections).to.not.be(undefined);
        });
    });

    describe('Advanced', function() {
        var projectionsStore = BasiGX.store.Projections;
        var xhr;
        var requests = [];
        beforeEach(function() {
            xhr = sinon.useFakeXMLHttpRequest();
            xhr.onCreate = function (xhr) {
                requests.push(xhr);
            }
        });

        afterEach(function() {
            projectionsStore.removeAll();
            xhr.restore();
            requests = [];
        });

        it('requests data from epsg.io for each EPSG code provided', function() {
            var promise = BasiGX.util.Projection.fetchProj4jCrsDefinitions([
                'EPSG:4326',
                'EPSG:3857'
            ]);

            expect(requests[0].url).to.contain('https://epsg.io/?q=4326');
            expect(requests[1].url).to.contain('https://epsg.io/?q=3857');

            // respond with dummy data so the promise resolves
            requests[0].respond(200, { "Content-Type": "application/json" }, '{ "results": [{ "code": 4326 }] }');
            requests[1].respond(200, { "Content-Type": "application/json" }, '{ "results": [{ "code": 3857 }] }');
            return promise;
        });

        it('uses data from the projections store when available', function() {
            // pre-load two definitions
            projectionsStore.loadData([{
                code: 4326,
                name: 'WGS 84',
                proj4: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
                unit: 'degree (supplier to define representation)',
            }, {
                code: 3857,
                name: 'WGS 84 / Pseudo-Mercator',
                proj4: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs',
                unit: 'metre'
            }]);

            // request three definitions
            var promise = BasiGX.util.Projection.fetchProj4jCrsDefinitions([
                'EPSG:4326',
                'EPSG:3857',
                'EPSG:29902'
            ]);

            // number of xhr requersts should be only 1, for the non pre-loaded definition
            expect(requests.length).to.be(1);
            expect(requests[0].url).to.contain('https://epsg.io/?q=29902');

            // respond with dummy data so the promise resolves
            requests[0].respond(200, { "Content-Type": "application/json" }, '{ "results": [{ "code": 29902 }] }');
            return promise.then(function (data) {
                expect(+data[0].code).to.be(4326);
                expect(+data[1].code).to.be(3857);
                expect(+data[2].code).to.be(29902);
            });
        });
    });
});
