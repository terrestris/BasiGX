Ext.Loader.syncRequire(['BasiGX.util.Color']);

describe('BasiGX.util.Color', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Color).to.not.be(undefined);
        });
    });

    describe('Static methods', function() {

        describe('#hexToRgba', function() {
            it('converts a hexadecimal color to a rgba-color', function() {
                var hex = '#ff0000';
                var got = BasiGX.util.Color.hexToRgba(hex);
                var expected = 'rgba(255,0,0,1)';
                expect(got).to.be(expected);
            });
            it('accepts an optional opacity', function() {
                var hex = '#ff0000';
                var got = BasiGX.util.Color.hexToRgba(hex, 0.42);
                var expected = 'rgba(255,0,0,0.42)';
                expect(got).to.be(expected);
            });
            it('works with or without leading "#"', function() {
                var hex = 'ff0000';
                var got = BasiGX.util.Color.hexToRgba(hex);
                var expected = 'rgba(255,0,0,1)';
                expect(got).to.be(expected);

                var got2 = BasiGX.util.Color.hexToRgba(hex, 0.42);
                var expected2 = 'rgba(255,0,0,0.42)';
                expect(got2).to.be(expected2);
            });
        });

        describe('#hex8ToRgba', function() {
            it('converts a hexadecimal color to a rgba-color', function() {
                var hex = '#ff0000ff';
                var got = BasiGX.util.Color.hex8ToRgba(hex);
                var expected = 'rgba(255,0,0,1)';
                expect(got).to.be(expected);
            });
            it('understands opacity', function() {
                var hex = '#ff0000bf';
                var got = BasiGX.util.Color.hex8ToRgba(hex);
                var expected = 'rgba(255,0,0,0.75)';
                expect(got).to.be(expected);
            });
            it('works with or without leading "#"', function() {
                var hex = 'ff0000ff';
                var got = BasiGX.util.Color.hex8ToRgba(hex);
                var expected = 'rgba(255,0,0,1)';
                expect(got).to.be(expected);
            });
        });

        describe('#rgbaToHex', function() {
            it('converts a rgba-color to a hexadecimal color', function() {
                var rgba = 'rgba(255,0,0,1)';
                var got = BasiGX.util.Color.rgbaToHex(rgba);
                var expected = '#ff0000';
                expect(got).to.be(expected);
            });
            it('is case insensitive', function() {
                var rgba = 'RGbA(255,0,0,1)';
                var got = BasiGX.util.Color.rgbaToHex(rgba);
                var expected = '#ff0000';
                expect(got).to.be(expected);
            });
            it('ignores spaces', function() {
                // we should make the method accept multiple spaces, right?
                var rgba = 'rgba ( 255 , 0 , 0 , 1 )';
                var got = BasiGX.util.Color.rgbaToHex(rgba);
                var expected = '#ff0000';
                expect(got).to.be(expected);
            });
            it('ignores the alpha channel', function() {
                var rgba1 = 'rgba(255,0,0,1)';
                var rgba2 = 'rgba(255,0,0,0.42)';
                var rgba3 = 'rgba(255,0,0,0)';
                var got1 = BasiGX.util.Color.rgbaToHex(rgba1);
                var got2 = BasiGX.util.Color.rgbaToHex(rgba2);
                var got3 = BasiGX.util.Color.rgbaToHex(rgba3);
                var expected = '#ff0000';
                expect(got1).to.be(expected);
                expect(got2).to.be(expected);
                expect(got3).to.be(expected);
            });
            it('returns the empty string on unexpected input', function() {
                var got1 = BasiGX.util.Color.rgbaToHex('');
                var got2 = BasiGX.util.Color.rgbaToHex(undefined);
                var got3 = BasiGX.util.Color.rgbaToHex(0);
                var got4 = BasiGX.util.Color.rgbaToHex(null);
                var got5 = BasiGX.util.Color.rgbaToHex(false);
                var got6 = BasiGX.util.Color.rgbaToHex('pupe-pape');
                var got7 = BasiGX.util.Color.rgbaToHex('rgb(255,0)');
                expect(got1).to.be('');
                expect(got2).to.be('');
                expect(got3).to.be('');
                expect(got4).to.be('');
                expect(got5).to.be('');
                expect(got6).to.be('');
                expect(got7).to.be('');
            });
        });

        describe('#rgbaToHex8', function() {
            it('converts a rgba-color to a hexadecimal color', function() {
                var rgba = 'rgba(255,0,0,1)';
                var got = BasiGX.util.Color.rgbaToHex8(rgba);
                var expected = '#ff0000ff';
                expect(got).to.be(expected);
            });
            it('understands alpha', function() {
                var rgba = 'rgba(255,0,0,0.75)';
                var got = BasiGX.util.Color.rgbaToHex8(rgba);
                var expected = '#ff0000bf';
                expect(got).to.be(expected);
            });
            it('is case insensitive', function() {
                var rgba = 'RGbA(255,0,0,1)';
                var got = BasiGX.util.Color.rgbaToHex8(rgba);
                var expected = '#ff0000ff';
                expect(got).to.be(expected);
            });
            it('ignores spaces', function() {
                // we should make the method accept multiple spaces, right?
                var rgba = 'rgba ( 255 , 0 , 0 , 1 )';
                var got = BasiGX.util.Color.rgbaToHex8(rgba);
                var expected = '#ff0000ff';
                expect(got).to.be(expected);
            });
        });

        describe('#makeHex', function() {
            it('returns a two-digit representation in hex', function() {
                var numStr1 = '0';
                var got1 = BasiGX.util.Color.makeHex(numStr1);
                var expected1 = '00';
                expect(got1).to.be(expected1);

                var numStr2 = '85';
                var got2 = BasiGX.util.Color.makeHex(numStr2);
                var expected2 = '55';
                expect(got2).to.be(expected2);

                var numStr3 = '170';
                var got3 = BasiGX.util.Color.makeHex(numStr3);
                var expected3 = 'aa';
                expect(got3).to.be(expected3);

                var numStr4 = '255';
                var got4 = BasiGX.util.Color.makeHex(numStr4);
                var expected4 = 'ff';
                expect(got4).to.be(expected4);
            });
        });

        describe('#rgbaAsArray', function() {
            it('turns a rgba strinto an array', function() {
                var rgba = 'rgba(255,0,0,1)';
                var got = BasiGX.util.Color.rgbaAsArray(rgba);
                var expected = ['rgba(255,0,0,1', '255', '0', '0', '1'];
                expect(got[0]).to.be(expected[0]);
                expect(got[1]).to.be(expected[1]);
                expect(got[2]).to.be(expected[2]);
                expect(got[3]).to.be(expected[3]);
                expect(got[4]).to.be(expected[4]);
            });
        });

    });
});
