Ext.Loader.syncRequire(['BasiGX.view.container.SLDStyler']);

describe('BasiGX.view.container.SLDStyler', function() {
    var sld = '<?xml version="1.0" encoding="UTF-8"?>' +
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
          '</sld:FeatureTypeStyle>' +
        '</sld:UserStyle>' +
      '</sld:NamedLayer>' +
    '</sld:StyledLayerDescriptor>';
    var styler = Ext.create('BasiGX.view.container.SLDStyler', {
        backendUrls: {
            pictureList: {
                url: 'rest/images',
                method: 'GET'
            },
            pictureSrc: {
                url: 'image/getThumbnail.action?id='
            },
            pictureUpload: {
                url: 'image/upload.action?'
            },
            graphicDelete: {
                url: 'rest/images/',
                method: 'DELETE'
            },
            geoServerUrl: '../resources/ajax-loader.gif',
            geoserverFontListUrl: null,
            geoserverFontUrl: null
        },
        layer: 'namespace:layername',
        sld: sld,
        ruleName: 'rule1',
        mode: 'polygon'
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.container.SLDStyler).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            expect(styler).to.be.a(BasiGX.view.container.SLDStyler);
        });

    });
    describe('In depth', function() {
        it('handles geometry mode correctly', function() {
            var mode = styler.getMode();
            expect(mode).to.eql('polygon');
            var fieldsetName = styler.down('fieldset').name;
            expect(fieldsetName).to.eql('polygonstyle');
        });
        it('generates SLD from form values', function() {
            var sld = styler.getSldFromFormValues();
            expect(sld).to.not.be(undefined);
            expect(sld).to.contain('<sld');
        });
        it('reflects form value changes in SLD', function() {
            var opacitySlider = styler.down('slider[name=graphic-opacity]');
            opacitySlider.setValue(40);
            var rotationSlider = styler.down('slider[name=graphic-rotation]');
            rotationSlider.setValue(90);
            var scaleSlider = styler.down('slider[name=graphic-scale]');
            scaleSlider.setValue(11);
            var strokeColor = styler.down('colorbutton[name=stroke]');
            strokeColor.setValue('#ff001100');

            var sld = styler.getSldFromFormValues();
            var obj = BasiGX.util.SLD.toSldObject(sld);
            var graphic = obj.value.namedLayerOrUserLayer[0]
                .namedStyleOrUserStyle[0].featureTypeStyle[0].rule[0]
                .symbolizer[0].value.fill.graphicFill.graphic;
            expect(graphic.opacity.content[0]).to.equal('0.4');
            expect(graphic.rotation.content[0]).to.equal('90');
            expect(graphic.size.content[0]).to.equal('11');
        });
    });
});
