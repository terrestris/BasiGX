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
        it('can be instantiated', function(){
            expect(combo).to.be.a(BasiGX.view.combo.Language);
        });
    });
    describe('default application language', function() {
        it('found a default application language', function() {
            expect(combo.getDefaultLanguage()).to.not.be(undefined);
            expect(combo.getDefaultLanguage()).to.be.a('string');
        });
    });
    describe('locale template url', function() {
        it('found a template for locale url', function() {
            expect(combo.getAppLocaleUrlTpl()).to.not.be(undefined);
            expect(combo.getAppLocaleUrlTpl()).to.be.a('string');
        });
    });
    describe('defaults', function() {
        it('has some default languages', function(){
            expect(combo.getLanguages()).to.not.be(undefined);
            expect(combo.getLanguages()).to.be.an(Array);
        });
    });
});
