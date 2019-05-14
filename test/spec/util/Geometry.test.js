Ext.Loader.syncRequire(['BasiGX.util.Geometry']);

describe('BasiGX.util.Geometry', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Geometry).to.not.be(undefined);
        });

        it('can test for overlapping point geometries', function() {
            var fmt = new ol.format.GeoJSON();
            var feat = fmt.readFeature({
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [102.0, 0.5]
                },
                'properties': {
                    'prop0': 'value0'
                }
            });
            var feats = [feat, feat];
            var dupes = BasiGX.util.Geometry.getGeometryDuplicates(feats);
            expect(dupes.length).to.be(1);
        });

        it('can test for overlapping line geometries', function() {
            var fmt = new ol.format.GeoJSON();
            var feat = fmt.readFeature({
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                        [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                    ]
                },
                'properties': {
                    'prop0': 'value0',
                    'prop1': 0.0
                }
            });
            var feats = [feat, feat];
            var dupes = BasiGX.util.Geometry.getGeometryDuplicates(feats);
            expect(dupes.length).to.be(1);
        });

        it('can test for overlapping polygon geometries', function() {
            var fmt = new ol.format.GeoJSON();
            var feat = fmt.readFeature({
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [
                        [
                            [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                            [100.0, 1.0], [100.0, 0.0]
                        ]
                    ]
                },
                'properties': {
                    'prop0': 'value0',
                    'prop1': { 'this': 'that' }
                }
            });
            var feats = [feat, feat];
            var dupes = BasiGX.util.Geometry.getGeometryDuplicates(feats);
            expect(dupes.length).to.be(1);
        });

        it('can test for overlapping multipoint geometries', function() {
            var fmt = new ol.format.GeoJSON();
            var feat = fmt.readFeature({
                'type': 'Feature',
                'geometry': {
                    'type': 'MultiPoint',
                    'coordinates': [
                        [10, 40], [40, 30], [20, 20], [30, 10]
                    ]
                },
                'properties': {
                    'prop0': 'value0'
                }
            });
            var feats = [feat, feat];
            var dupes = BasiGX.util.Geometry.getGeometryDuplicates(feats);
            expect(dupes.length).to.be(1);
        });

        it('can test for overlapping multiline geometries', function() {
            var fmt = new ol.format.GeoJSON();
            var feat = fmt.readFeature({
                'type': 'Feature',
                'geometry': {
                    'type': 'MultiLineString',
                    'coordinates': [
                        [[10, 10], [20, 20], [10, 40]],
                        [[40, 40], [30, 30], [40, 20], [30, 10]]
                    ]
                },
                'properties': {
                    'prop0': 'value0'
                }
            });
            var feats = [feat, feat];
            var dupes = BasiGX.util.Geometry.getGeometryDuplicates(feats);
            expect(dupes.length).to.be(1);
        });

        it('can test for overlapping multipolygon geometries', function() {
            var fmt = new ol.format.GeoJSON();
            var feat = fmt.readFeature({
                'type': 'Feature',
                'geometry': {
                    'type': 'MultiPolygon',
                    'coordinates': [
                        [
                            [[40, 40], [20, 45], [45, 30], [40, 40]]
                        ],
                        [
                            [[20, 35], [10, 30], [10, 10], [30, 5], [45, 20], [20, 35]],
                            [[30, 20], [20, 15], [20, 25], [30, 20]]
                        ]
                    ]
                },
                'properties': {
                    'prop0': 'value0'
                }
            });
            var feats = [feat, feat];
            var dupes = BasiGX.util.Geometry.getGeometryDuplicates(feats);
            expect(dupes.length).to.be(1);
        });

        it('can test for overlapping geometry collection geometries', function() {
            var fmt = new ol.format.GeoJSON();
            var feat = fmt.readFeature({
                'type': 'Feature',
                'geometry': {
                    'type': 'GeometryCollection',
                    'geometries': [
                        {
                            'type': 'Point',
                            'coordinates': [
                                61.34765625,
                                48.63290858589535
                            ]
                        }
                    ]
                },
                'properties': {
                    'prop0': 'value0'
                }
            });
            var feats = [feat, feat];
            var dupes = BasiGX.util.Geometry.getGeometryDuplicates(feats);
            expect(dupes.length).to.be(1);
        });
    });
});
