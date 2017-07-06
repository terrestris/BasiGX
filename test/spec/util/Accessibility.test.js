Ext.Loader.syncRequire(['BasiGX.util.Accessibility']);

describe('BasiGX.util.Accessibility', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.Accessibility).to.not.be(undefined);
        });
        it('is aliased as BasiGX.util.A11y', function() {
            expect(BasiGX.util.A11y).to.not.be(undefined);
            expect(BasiGX.util.A11y).to.be(BasiGX.util.Accessibility);
        });
    });

    describe('Static methods', function() {
        var htmlElement = null;
        beforeEach(function() {
            htmlElement = document.querySelector('html');
        });
        afterEach(function() {
            htmlElement.removeAttribute('lang');
            htmlElement = null;
        });

        describe('#getHtmlElement', function() {
            it('returns the <html>-element as Ext.Element', function() {
                var got = BasiGX.util.Accessibility.getHtmlElement();
                expect(got).to.be.ok();
                expect(got).to.be.an(Ext.Element);
                expect(got.dom).to.be.ok();
                expect(got.dom).to.be(htmlElement);
            });
        });

        describe('#setHtmlLanguage', function() {
            it('sets the `lang`-attribute of the `<html>`-element', function() {
                var fakeLanguage = 'snork-snork';
                var before = htmlElement.getAttribute('lang');
                expect(before).to.not.be(fakeLanguage);

                BasiGX.util.Accessibility.setHtmlLanguage(fakeLanguage);

                var after = htmlElement.getAttribute('lang');
                expect(after).to.not.be(before);
                expect(after).to.be(fakeLanguage);
            });
        });

        describe('#getHtmlLanguage', function() {
            it('returns the empty string if attribute not set', function() {
                var got = BasiGX.util.Accessibility.getHtmlLanguage();
                expect(got).to.be('');
            });
            it('returns the lang attribute if that is set', function() {
                htmlElement.setAttribute('lang', 'Barty');
                var got = BasiGX.util.Accessibility.getHtmlLanguage();
                expect(got).to.be('Barty');
            });
        });

    });
});
