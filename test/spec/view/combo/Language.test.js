Ext.Loader.syncRequire([
    'BasiGX.view.combo.Language'
]);

describe('BasiGX.view.combo.Language', function() {
    var combo;
    beforeEach(function() {
        combo = Ext.create('BasiGX.view.combo.Language', {
            onLoadAppLocaleFailure: function() {}
        });
    });
    afterEach(function() {
        combo.destroy();
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.combo.Language).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            expect(combo).to.be.a(BasiGX.view.combo.Language);
        });
    });
    describe('default application language', function() {
        it('found a default application language', function() {
            expect(combo.getDefaultLanguage()).to.not.be(undefined);
            expect(combo.getDefaultLanguage()).to.be.a('string');
        });
        it('sets the default language on the <html>-element', function() {
            var htmlElement = document.querySelector('html');
            var currentLang = htmlElement.getAttribute('lang');
            expect(currentLang).to.be(combo.getDefaultLanguage());
        });
    });
    describe('locale template url', function() {
        it('found a template for locale url', function() {
            expect(combo.getAppLocaleUrlTpl()).to.not.be(undefined);
            expect(combo.getAppLocaleUrlTpl()).to.be.a('string');
        });
    });
    describe('defaults', function() {
        it('has some default languages', function() {
            expect(combo.getLanguages()).to.not.be(undefined);
            expect(combo.getLanguages()).to.be.an(Array);
        });
    });
    describe('can change the language', function() {
        var origExtLogInfo = null;
        var htmlElement = null;
        beforeEach(function() {
            htmlElement = document.querySelector('html');
            origExtLogInfo = Ext.Logger.info;
            Ext.Logger.info = function() {}; // don't output logs when testing
        });
        afterEach(function() {
            Ext.Logger.info = origExtLogInfo; // restore old log
            origExtLogInfo = null;
            htmlElement = null;
        });
        it('changes the lang-attribute of the html-element', function() {
            var mockLocale = 'humptydumpty';
            // The followiing lines mockup a change in the language:
            // 1) set the private locale property
            combo.locale = mockLocale;
            // 2) Mock up a successfull response object
            var responseMock = {
                responseText: '{}'
            };
            // 3) Save the language to compare against it later
            var langBefore = htmlElement.getAttribute('lang');
            // 4) emulate a succesfull callback, not optimal but better than
            //    nothing
            combo.onLoadAppLocaleSuccess.call(combo, responseMock);

            var langAfter = htmlElement.getAttribute('lang');

            expect(langAfter).to.not.be(langBefore);
            expect(langAfter).to.be(mockLocale); // it's 'humptydumpty' now

            // cleanup
            htmlElement.setAttribute('lang', langBefore);
        });
    });
});
