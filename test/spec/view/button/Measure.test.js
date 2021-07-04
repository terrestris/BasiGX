Ext.Loader.syncRequire(['BasiGX.view.button.Measure']);

describe('BasiGX.view.button.Measure', function() {

    var btn;
    var buttonDiv;
    var testObjs;

    beforeEach(function() {
        testObjs = TestUtil.setupTestObjects();
        buttonDiv = TestUtil.setupTestDiv();
        btn = Ext.create('BasiGX.view.button.Measure', {
            renderTo: buttonDiv
        });
    });

    afterEach(function() {
        TestUtil.teardownTestObjects(testObjs);
        if (btn) {
            btn.destroy();
        }
        TestUtil.teardownTestDiv(buttonDiv);
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.Measure).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var myBtn = Ext.create('BasiGX.view.button.Measure');
            expect(myBtn).to.be.a(BasiGX.view.button.Measure);
            // teardown
            myBtn.destroy();
        });
    });

    describe('Static methods', function() {
        describe('#CSS_CLASSES.toSelector', function() {
            var toSelector = BasiGX.view.button.Measure.CSS_CLASSES.toSelector;
            it('transforms space separated string into CSS-selectors',
                function() {
                    expect(toSelector('a')).to.be('.a');
                    expect(toSelector('  a  ')).to.be('.a');
                    expect(toSelector('a b')).to.be('.a.b');
                    expect(toSelector('a   b')).to.be('.a.b');
                    expect(toSelector('  a b  ')).to.be('.a.b');
                    expect(toSelector('  a   b  ')).to.be('.a.b');
                    expect(toSelector('a b c d')).to.be('.a.b.c.d');
                    expect(toSelector('  a   b   c   d  ')).to.be('.a.b.c.d');
                }
            );
            it('throws un unexpected input',
                function() {
                    expect(toSelector).withArgs(undefined).to.throwException();
                    expect(toSelector).withArgs('').to.throwException();
                    expect(toSelector).withArgs(null).to.throwException();
                }
            );
        });
    });

    describe('Instantiation', function() {

        it('can be instanciated', function() {
            expect(btn).to.be.a(BasiGX.view.button.Measure);
        });

        it('is autoconfigured with a map', function() {
            expect(btn.map).to.be.ok();
            expect(btn.map).to.be.a(ol.Map);
            expect(btn.map).to.be(testObjs.map);
        });

        it('automatically adds a vector layer', function() {
            expect(btn.map.getLayers().getLength()).to.be(1);
            expect(btn.map.getLayers().item(0)).to.be.a(ol.layer.Vector);
        });

        it('ensures the vector layer is correctly configured', function() {
            var vectorLayer = btn.map.getLayers().item(0);
            var LayerUtil = BasiGX.util.Layer;

            var expectedName = LayerUtil.NAME_MEASURE_LAYER;
            var showInLayerSwitcherKey = LayerUtil.KEY_DISPLAY_IN_LAYERSWITCHER;

            expect(vectorLayer.get('name')).to.be(expectedName);
            expect(vectorLayer.get(showInLayerSwitcherKey)).to.be(false);
        });

        it('ensures the vector layer style is correct', function() {
            var vectorLayer = btn.map.getLayers().item(0);
            var vectorStyle = vectorLayer.getStyle();

            var fill = vectorStyle.getFill();
            var stroke = vectorStyle.getStroke();
            var image = vectorStyle.getImage();

            expect(fill.getColor()).to.be(btn.fillColor);
            expect(stroke.getColor()).to.be(btn.strokeColor);
            expect(image.getFill().getColor()).to.be(btn.fillColor);
        });

        it('assigns the created layer to `measureVectorLayer`', function() {
            var vectorLayer = btn.map.getLayers().item(0);
            expect(vectorLayer).to.be(btn.measureVectorLayer);
        });

        it('creates an ol.interaction.Draw', function() {
            var draw = btn.drawAction;
            expect(draw).to.be.ok();
            expect(draw).to.be.an(ol.interaction.Draw);
        });

        it('ensures the ol.interaction.Draw is deactivated', function() {
            var draw = btn.drawAction;
            expect(draw.getActive()).to.be(false);
        });
    });

    describe('#drawTypeByMeasureType', function() {
        it('returns "MultiLineString" for measureType "line"', function() {
            btn.measureType = 'line';
            expect(btn.drawTypeByMeasureType()).to.be('MultiLineString');
        });
        it('returns "MultiLineString" for measureType "angle"', function() {
            btn.measureType = 'angle';
            expect(btn.drawTypeByMeasureType()).to.be('MultiLineString');
        });
        it('returns "MultiPolygon" for measureType "polygon"', function() {
            btn.measureType = 'polygon';
            expect(btn.drawTypeByMeasureType()).to.be('MultiPolygon');
        });
        it('returns "MultiLineString" for anything else', function() {
            btn.measureType = 'humpty-dumpty';
            expect(btn.drawTypeByMeasureType()).to.be('MultiLineString');
        });
    });

    describe('#btnTextByType', function() {
        it('returns different valid values for supported measureTypes',
            function() {
                btn.measureType = 'line';
                var gotForLine = btn.btnTextByType();
                btn.measureType = 'polygon';
                var gotForPolygon = btn.btnTextByType();
                btn.measureType = 'angle';
                var gotForAngle = btn.btnTextByType();

                expect(gotForLine).not.to.be(gotForPolygon);
                expect(gotForLine).not.to.be(gotForAngle);
                expect(gotForPolygon).not.to.be(gotForAngle);

                expect(gotForLine).to.match(/\{/);
                expect(gotForPolygon).to.match(/\{/);
                expect(gotForAngle).to.match(/\{/);
                expect(gotForLine).to.match(/\}/);
                expect(gotForPolygon).to.match(/\}/);
                expect(gotForAngle).to.match(/\}/);
            }
        );
        it('returns `undefined` for anything else', function() {
            btn.measureType = 'humpty-dumpty';
            expect(btn.btnTextByType()).to.be(undefined);
        });
    });

    describe('#cleanUp', function() {
        it('deactivates the draw action', function() {
            // setup
            var draw = btn.drawAction;
            expect(draw.getActive()).to.be(false);
            btn.toggle();
            expect(draw.getActive()).to.be(true);

            // call method
            btn.cleanUp();

            // test expectation
            expect(draw.getActive()).to.be(false);
        });
        it('calls ol.Observable.unByKey to remove event handlers', function() {
            // setup
            btn.toggle();
            var spy = sinon.spy(ol.Observable, 'unByKey');

            // call method
            btn.cleanUp();

            expect(spy.called).to.be(true);

            ol.Observable.unByKey.restore();
        });
        it('calls #cleanUpToolTips to remove tooltips', function() {
            var spy = sinon.spy(btn, 'cleanUpToolTips');
            btn.cleanUp();

            expect(spy.called).to.be(true);

            btn.cleanUpToolTips.restore();
        });
        it('removes any features of the vector source', function() {
            // setup
            var vectorSource = btn.measureVectorLayer.getSource();
            var feature = new ol.Feature({
                geometry: new ol.geom.MultiLineString([[[1, 2], [3, 4]]])
            });
            vectorSource.addFeature(feature);
            expect(vectorSource.getFeatures()).to.have.length(1);

            btn.cleanUp();

            expect(vectorSource.getFeatures()).to.have.length(0);
        });
    });

    describe('#angle', function() {
        it('calculates the angle in deegrees', function() {
            var start = [0, 0];
            var ends = [
                [1, 0], // east, 3 o'clock
                [1, -1], // south-east, between 4 and 5 o'clock
                [0, -1], // south, 6 o'clock
                [-1, -1], // south-west, between 7 and 8 o'clock
                [-1, 0], // west, 9 o'clock
                [-1, 1], // north-west, between 10 and 11 o'clock
                [0, 1], // north, 12 o'clock
                [1, 1] // north-east, between 1 and 2 o'clock
            ];
            var expectedAngles = [
                180,
                135,
                90,
                45,
                0,
                -45,
                -90,
                -135
            ];
            expect(ends.length).to.be(expectedAngles.length);
            Ext.each(ends, function(end, index) {
                var got = btn.angle(start, end);
                expect(got).to.be(expectedAngles[index]);
            });
        });
    });

    describe('#angle360', function() {
        it('calculates the angle in deegrees', function() {
            var start = [0, 0];
            var ends = [
                [1, 0], // east, 3 o'clock
                [1, -1], // south-east, between 4 and 5 o'clock
                [0, -1], // south, 6 o'clock
                [-1, -1], // south-west, between 7 and 8 o'clock
                [-1, 0], // west, 9 o'clock
                [-1, 1], // north-west, between 10 and 11 o'clock
                [0, 1], // north, 12 o'clock
                [1, 1] // north-east, between 1 and 2 o'clock
            ];
            var expectedAngles = [
                180,
                135,
                90,
                45,
                0,
                315,
                270,
                225
            ];
            expect(ends.length).to.be(expectedAngles.length);
            Ext.each(ends, function(end, index) {
                var got = btn.angle360(start, end);
                expect(got).to.be(expectedAngles[index]);
            });
        });
    });

    describe('#makeClockwise', function() {
        it('returns a clockwised version of an angle', function() {
            expect(btn.makeClockwise(0)).to.be(360);
            expect(btn.makeClockwise(45)).to.be(315);
            expect(btn.makeClockwise(90)).to.be(270);
            expect(btn.makeClockwise(135)).to.be(225);
            expect(btn.makeClockwise(180)).to.be(180);
            expect(btn.makeClockwise(225)).to.be(135);
            expect(btn.makeClockwise(270)).to.be(90);
            expect(btn.makeClockwise(315)).to.be(45);
            expect(btn.makeClockwise(360)).to.be(0);
        });
    });

    describe('#makeZeroDegreesAtNorth', function() {
        it('shifts a calculates the angle so 0° is in the north', function() {
            var start = [0, 0];
            var ends = [
                [1, 0], // east, 3 o'clock
                [1, -1], // south-east, between 4 and 5 o'clock
                [0, -1], // south, 6 o'clock
                [-1, -1], // south-west, between 7 and 8 o'clock
                [-1, 0], // west, 9 o'clock
                [-1, 1], // north-west, between 10 and 11 o'clock
                [0, 1], // north, 12 o'clock
                [1, 1] // north-east, between 1 and 2 o'clock
            ];
            var expectedAngles = [
                270,
                225,
                180,
                135,
                90,
                45,
                360, // also 0
                315
            ];
            expect(ends.length).to.be(expectedAngles.length);
            Ext.each(ends, function(end, index) {
                var angle = btn.angle360(start, end);
                var got = btn.makeZeroDegreesAtNorth(angle);
                expect(got).to.be(expectedAngles[index]);
            });
        });
    });

    describe('#formatAngle', function() {
        it('formats the angle of a multiline as expected', function() {
            var start = [0, 0];
            var ends = [
                [1, 0], // east, 3 o'clock
                [1, -1], // south-east, between 4 and 5 o'clock
                [0, -1], // south, 6 o'clock
                [-1, -1], // south-west, between 7 and 8 o'clock
                [-1, 0], // west, 9 o'clock
                [-1, 1], // north-west, between 10 and 11 o'clock
                [0, 1], // north, 12 o'clock
                [1, 1] // north-east, between 1 and 2 o'clock
            ];
            var lines = [];
            Ext.each(ends, function(end) {
                lines.push(
                    new ol.geom.LineString([start, end])
                );
            });
            var expectedAngles = [
                '90.00°',
                '135.00°',
                '180.00°',
                '225.00°',
                '270.00°',
                '315.00°',
                '0.00°', // also 0°
                '45.00°'
            ];
            expect(ends.length).to.be(expectedAngles.length);
            expect(lines.length).to.be(expectedAngles.length);
            Ext.each(lines, function(line, index) {
                var angle = btn.formatAngle(line);
                expect(angle).to.be(expectedAngles[index]);
            });
        });
    });

    describe('#formatArea', function() {
        it('formats the area of a polygon as expected', function() {

            var vertices = [[0, 0], [0, 5], [5, 5], [5, 0], [0, 0]];
            var geom = new ol.geom.Polygon([vertices]);

            var area = btn.formatArea(geom);
            expect(area).to.be('24.94 m<sup>2</sup>');
        });
    });
});
