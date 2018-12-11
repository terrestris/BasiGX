Ext.Loader.syncRequire(['BasiGX.view.window.FileUploadWindow']);

describe('BasiGX.view.window.FileUploadWindow', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.window.FileUploadWindow).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.window.FileUploadWindow');
            expect(inst).to.be.a(BasiGX.view.window.FileUploadWindow);
            // teardown
            inst.destroy();
        });
    });
});
