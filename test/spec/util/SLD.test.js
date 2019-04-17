Ext.Loader.syncRequire(['BasiGX.util.SLD']);

describe('BasiGX.util.SLD', function() {
    var sld;
    beforeEach(function() {
        sld =
            '<sld:StyledLayerDescriptor xmlns="http://www.opengis.net/sld" ' +
            'xmlns:sld="http://www.opengis.net/sld" xmlns:gml="http://www.' +
            'opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" version=' +
            '"1.0.0">' +
            '<sld:NamedLayer>' +
            '<sld:Name>polygon</sld:Name>' +
            '<sld:UserStyle>' +
              '<sld:Name>polygon</sld:Name>' +
              '<sld:Title>Border-less gray fill</sld:Title>' +
              '<sld:Abstract>polygon</sld:Abstract>' +
              '<sld:FeatureTypeStyle>' +
                '<sld:Name>name</sld:Name>' +
                '<sld:Rule>' +
                  '<sld:Name>rule1</sld:Name>' +
                  '<sld:PolygonSymbolizer>' +
                    '<sld:Fill>' +
                      '<sld:GraphicFill>' +
                        '<sld:Graphic>' +
                          '<sld:Mark>' +
                            '<sld:WellKnownName>ttf://DejaVu Sans#0xF1B2' +
                            '</sld:WellKnownName>' +
                            '<sld:Fill>' +
                              '<sld:CssParameter name="fill">#000000' +
                              '</sld:CssParameter>' +
                            '</sld:Fill>' +
                            '<sld:Stroke>' +
                              '<sld:CssParameter name="stroke">#adadad' +
                              '</sld:CssParameter>' +
                            '</sld:Stroke>' +
                          '</sld:Mark>' +
                          '<sld:Size>53</sld:Size>' +
                          '<sld:Rotation>360.0</sld:Rotation>' +
                        '</sld:Graphic>' +
                      '</sld:GraphicFill>' +
                      '<sld:CssParameter name="fill">#000000' +
                      '</sld:CssParameter>' +
                    '</sld:Fill>' +
                    '<sld:Stroke>' +
                      '<sld:CssParameter name="stroke">#adadad' +
                      '</sld:CssParameter>' +
                    '</sld:Stroke>' +
                  '</sld:PolygonSymbolizer>' +
                '</sld:Rule>' +
                '<sld:Rule>' +
                  '<sld:Name>rule2</sld:Name>' +
                  '<sld:TextSymbolizer>' +
                  '<sld:Label>' +
                  '<ogc:PropertyName>ao_key</ogc:PropertyName>' +
                  '</sld:Label>' +
                    '<sld:Font>' +
                      '<sld:CssParameter name="font-family">SansSerif</sld:CssParameter>' +
                      '<sld:CssParameter name="font-size">12</sld:CssParameter>' +
                      '<sld:CssParameter name="font-style">normal</sld:CssParameter>' +
                      '<sld:CssParameter name="font-weight">normal</sld:CssParameter>' +
                    '</sld:Font>' +
                  '</sld:TextSymbolizer>' +
                  '<sld:PointSymbolizer>' +
                    '<sld:Graphic>' +
                      '<sld:Mark>' +
                        '<sld:WellKnownName>circle</sld:WellKnownName>' +
                        '<sld:Fill>' +
                          '<sld:CssParameter name="fill">#ff6600</sld:CssParameter>' +
                        '</sld:Fill>' +
                        '<sld:Stroke/>' +
                      '</sld:Mark>' +
                      '<sld:Size>6</sld:Size>' +
                    '</sld:Graphic>' +
                  '</sld:PointSymbolizer>' +
                '</sld:Rule>' +
              '</sld:FeatureTypeStyle>' +
            '</sld:UserStyle>' +
          '</sld:NamedLayer>' +
        '</sld:StyledLayerDescriptor>';
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.SLD).to.not.be(undefined);
        });
    });
    describe('In depth', function() {
        it('can write an javascript object from SLD string', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            expect(obj).to.not.be(undefined);
            expect(obj).to.be.an('object');
        });
        it('can write an SLD string from a javascript object', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var sldString = BasiGX.util.SLD.toSldString(obj);
            expect(sldString).to.not.be(undefined);
            expect(sldString).to.contain('<sld');
        });
        it('converts lossless between SLD and javascript object', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var sldString = BasiGX.util.SLD.toSldString(obj);
            var obj2 = BasiGX.util.SLD.toSldObject(sldString);
            expect(obj2).to.eql(obj);
        });
        it('finds rules in SLD javascript object', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var rules = BasiGX.util.SLD.rulesFromSldObject(obj);
            expect(rules).to.not.be(undefined);
            expect(rules).to.be.an('array');
        });
        it('gets rule by name', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var name = 'rule1';
            var rule = BasiGX.util.SLD.getRuleByName(name, obj);
            expect(rule).to.not.be(undefined);
            expect(rule).to.be.an('object');
            expect(rule.name).to.equal(name);
        });
        it('updates a point symbolizer correctly', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var ruleName = 'rule1';
            var symbolizerObj = {
                fillColor: '#00ff24',
                fillOpacity: '0.7',
                fontAndUniCode: 'ttf://Arial#0x2592',
                graphicOpacity: '0.9',
                graphicRotation: '269',
                graphicSize: '57',
                strokeColor: '#ff000f',
                strokeOpacity: '0.5',
                strokeWidth: '2'
            };
            var modifiedObj = BasiGX.util.SLD
                .setPointSymbolizerInRule(symbolizerObj, ruleName, obj);
            expect(modifiedObj).to.not.be(undefined);
            expect(modifiedObj).to.be.an('object');
            var graphic = modifiedObj.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].featureTypeStyle[0].rule[0]
                .symbolizer[1].value.graphic;
            expect(graphic.externalGraphicOrMark[0]
                .fill.cssParameter[0].content[0]).to.equal(
                symbolizerObj.fillColor);
            expect(graphic.externalGraphicOrMark[0]
                .fill.cssParameter[1].content[0]).to.equal(
                symbolizerObj.fillOpacity);
            expect(graphic.externalGraphicOrMark[0]
                .wellKnownName.content[0]).to.equal(
                symbolizerObj.fontAndUniCode);
            expect(graphic.opacity.content[0]).to.equal(
                symbolizerObj.graphicOpacity);
            expect(graphic.rotation.content[0]).to.equal(
                symbolizerObj.graphicRotation);
            expect(graphic.size.content[0]).to.equal(
                symbolizerObj.graphicSize);
            expect(graphic.externalGraphicOrMark[0]
                .stroke.cssParameter[0].content[0]).to.equal(
                symbolizerObj.strokeColor);
            expect(graphic.externalGraphicOrMark[0]
                .stroke.cssParameter[1].content[0]).to.equal(
                symbolizerObj.strokeWidth);
            expect(graphic.externalGraphicOrMark[0]
                .stroke.cssParameter[2].content[0]).to.equal(
                symbolizerObj.strokeOpacity);
        });
        it('updates a line symbolizer correctly', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var ruleName = 'rule1';
            var symbolizerObj = {
                strokeColor: '#ff000f',
                strokeOpacity: '0.5',
                strokeWidth: '2'
            };
            var modifiedObj = BasiGX.util.SLD
                .setLineSymbolizerInRule(symbolizerObj, ruleName, obj);
            expect(modifiedObj).to.not.be(undefined);
            expect(modifiedObj).to.be.an('object');
            var stroke = modifiedObj.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].featureTypeStyle[0].rule[0]
                .symbolizer[1].value.stroke;
            expect(stroke.cssParameter[0].content[0]).to.equal(
                symbolizerObj.strokeColor);
            expect(stroke.cssParameter[1].content[0]).to.equal(
                symbolizerObj.strokeWidth);
            expect(stroke.cssParameter[2].content[0]).to.equal(
                symbolizerObj.strokeOpacity);
        });
        it('updates a polygon symbolizer correctly', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var ruleName = 'rule1';
            var symbolizerObj = {
                externalGraphicSrc: 'http://localhost/ajax-loader.gif',
                graphicOpacity: '0.9',
                graphicRotation: '269',
                graphicSize: '57'
            };
            var modifiedObj = BasiGX.util.SLD
                .setPolygonSymbolizerInRule(symbolizerObj, ruleName, obj);
            expect(modifiedObj).to.not.be(undefined);
            expect(modifiedObj).to.be.an('object');
            var graphic = modifiedObj.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].featureTypeStyle[0].rule[0]
                .symbolizer[0].value.fill.graphicFill.graphic;
            expect(graphic.externalGraphicOrMark[0]
                .onlineResource.href).to.equal(
                symbolizerObj.externalGraphicSrc);
            expect(graphic.opacity.content[0]).to.equal(
                symbolizerObj.graphicOpacity);
            expect(graphic.rotation.content[0]).to.equal(
                symbolizerObj.graphicRotation);
            expect(graphic.size.content[0]).to.equal(
                symbolizerObj.graphicSize);
        });
        it('updates a text symbolizer correctly', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var ruleName = 'rule1';
            var symbolizerObj = {
                fontFamily: 'SansSerif',
                fontSize: '13',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontFillColor: '#cc0f0f',
                labelAnchorPointX: '0.5',
                labelAnchorPointY: '-0.5',
                labelDisplacementX: '2',
                labelDisplacementY: '4',
                labelRotation: '15'
            };
            var modifiedObj = BasiGX.util.SLD
                .setTextSymbolizerInRule(symbolizerObj, ruleName, obj);
            expect(modifiedObj).to.not.be(undefined);
            expect(modifiedObj).to.be.an('object');
            var value = modifiedObj.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].featureTypeStyle[0].rule[0]
                .symbolizer[1].value;
            expect(value.font.cssParameter[0].content[0]).to.equal(
                symbolizerObj.fontFamily);
            expect(value.font.cssParameter[1].content[0]).to.equal(
                symbolizerObj.fontSize);
            expect(value.font.cssParameter[2].content[0]).to.equal(
                symbolizerObj.fontStyle);
            expect(value.font.cssParameter[3].content[0]).to.equal(
                symbolizerObj.fontWeight);
            expect(value.fill.cssParameter[0].content[0]).to.equal(
                symbolizerObj.fontFillColor);
            expect(value.labelPlacement.pointPlacement
                .anchorPoint.anchorPointX.content[0]).to.equal(
                symbolizerObj.labelAnchorPointX);
            expect(value.labelPlacement.pointPlacement
                .anchorPoint.anchorPointY.content[0]).to.equal(
                symbolizerObj.labelAnchorPointY);
            expect(value.labelPlacement.pointPlacement
                .displacement.displacementX.content[0]).to.equal(
                symbolizerObj.labelDisplacementX);
            expect(value.labelPlacement.pointPlacement
                .displacement.displacementY.content[0]).to.equal(
                symbolizerObj.labelDisplacementY);
            expect(value.labelPlacement
                .pointPlacement.rotation.content[0]).to.equal(
                symbolizerObj.labelRotation);
        });
        it('removes a text symbolizer correctly', function() {
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var ruleName = 'rule2';
            var modifiedObj = BasiGX.util.SLD
                .removeTextSymbolizerFromRule(ruleName, obj);
            expect(modifiedObj).to.not.be(undefined);
            expect(modifiedObj).to.be.an('object');
            var symbolizers = modifiedObj.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].featureTypeStyle[0].rule[1]
                .symbolizer;
            expect(symbolizers).to.be.an('array');
            expect(symbolizers.length).to.equal(1);
            expect(symbolizers[0].value.TYPE_NAME).to.equal(
                'SLD_1_0_0.PointSymbolizer');
            expect(symbolizers[0].value.TYPE_NAME).to.not.equal(
                'SLD_1_0_0.TextSymbolizer');
        });
    });
});
