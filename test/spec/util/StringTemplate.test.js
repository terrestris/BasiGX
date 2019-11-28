Ext.Loader.syncRequire(['BasiGX.util.StringTemplate']);

describe('BasiGX.util.StringTemplate', function () {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.StringTemplate).to.not.be(undefined);
        });
    });

    describe('Static methods', function() {

        var feature = null;

        beforeEach(function () {
            feature = new ol.Feature({
                id: 123,
                geometry: new ol.geom.Point([10, 10]),
                featProp: 'featValue',
                anotherFeatProp: 'anotherFeatValue'
            });
        });

        afterEach(function() {
            feature = null;
        });

        describe('#getTextFromTemplate', function() {
            it('is defined', function() {
                expect(BasiGX.util.StringTemplate.getTextFromTemplate).to.not.be(undefined);
            });
            it('is returns templated value for provided feature for single ' +
                'template occurance', function() {
                var tpl = '{{featProp}}';
                var got = BasiGX.util.StringTemplate.getTextFromTemplate(feature, tpl);
                expect(got).to.be(feature.get('featProp'));
            });
            it('is returns templated value for provided feature for multiple ' +
                'template occurancies', function() {
                var tpl = '{{featProp}}{{anotherFeatProp}}';
                var got = BasiGX.util.StringTemplate.getTextFromTemplate(feature, tpl);
                var tplValue = feature.get('featProp') + feature.get('anotherFeatProp');
                expect(got).to.be(tplValue);
            });
            it('is makes use of template config if provided', function() {
                var tpl = '<featProp>';
                var config = {
                    prefix: '<',
                    suffix: '>'
                };
                var got = BasiGX.util.StringTemplate.getTextFromTemplate(feature, tpl, config);
                expect(got).to.be(feature.get('featProp'));
            });
            it('returns feature id if custom template could not be applied', function() {
                var tpl = '{{featProp}}';
                var config = {
                    prefix: '<',
                    suffix: '>'
                };
                var got = BasiGX.util.StringTemplate.getTextFromTemplate(feature, tpl, config);
                expect(got).to.be(feature.id);
            });
            it('returns undefined if any template could not be applied and '+
                'feature has no id', function() {
                var tpl = '{{featProp}}';
                var config = {
                    prefix: '<',
                    suffix: '>'
                };
                delete feature.id;
                var got = BasiGX.util.StringTemplate.getTextFromTemplate(feature, tpl, config);
                expect(got).to.be(undefined);
            });
            it('replaces newline breaks in template by a html <br> tag', function() {
                var tpl = '{{featProp}}\n{{anotherFeatProp}}';
                var got = BasiGX.util.StringTemplate.getTextFromTemplate(feature, tpl);
                var tplValue = feature.get('featProp') + '<br>' + feature.get('anotherFeatProp');
                expect(got).to.be(tplValue);
            });
        });
    });
});
