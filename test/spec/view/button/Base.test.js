Ext.Loader.syncRequire(['BasiGX.view.button.Base']);

describe('BasiGX.view.button.Base', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.Base).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.Base');
            expect(btn).to.be.a(BasiGX.view.button.Base);
        });
    });
    describe('Tooltip bound if possible (direct instantiation)', function() {
        it('binds to tooltip if `setTooltip` exists', function() {
            var btn = Ext.create('BasiGX.view.button.Base', {
                viewModel: {
                    data:{
                        tooltip: 'My Tooltip'
                    }
                }
            });
            var bind = btn.getBind();
            expect(bind).to.be.ok();
            expect(bind.tooltip).to.be.ok();
            // teardown
            btn.destroy();
        });
        it('does not bind to tooltip if `setTooltip` is undefined', function() {
            // This is the case for modern builds, e.g.
            var origSetTooltip = BasiGX.view.button.Base.prototype.setTooltip;
            BasiGX.view.button.Base.prototype.setTooltip = undefined;
            var btn = Ext.create('BasiGX.view.button.Base', {
                viewModel: {
                    data:{
                        tooltip: 'My Tooltip'
                    }
                }
            });
            var bind = btn.getBind();
            expect(bind).to.be.ok();
            expect(bind.tooltip).to.not.be.ok();
            // teardown
            BasiGX.view.button.Base.prototype.setTooltip = origSetTooltip;
            btn.destroy();
        });
    });
    describe('Tooltip bound if possible (subclass)', function() {
        beforeEach(function() {
            Ext.define('BasiGX.test.BaseButtonSubClass', {
                extend: 'BasiGX.view.button.Base'
            });
        });
        afterEach(function() {
            Ext.undefine('BasiGX.test.BaseButtonSubClass');
        });

        it('binds to tooltip if `setTooltip` exists', function() {
            var btn = Ext.create('BasiGX.test.BaseButtonSubClass', {
                viewModel: {
                    data:{
                        tooltip: 'My Tooltip'
                    }
                }
            });
            var bind = btn.getBind();
            expect(bind).to.be.ok();
            expect(bind.tooltip).to.be.ok();
            // teardown
            btn.destroy();
        });
        it('does not bind to tooltip if `setTooltip` is undefined', function() {
            // This is the case for modern builds, e.g.
            var orig = BasiGX.test.BaseButtonSubClass.prototype.setTooltip;
            BasiGX.test.BaseButtonSubClass.prototype.setTooltip = undefined;
            var btn = Ext.create('BasiGX.test.BaseButtonSubClass', {
                viewModel: {
                    data:{
                        tooltip: 'My Tooltip'
                    }
                }
            });
            var bind = btn.getBind();
            expect(bind).to.be.ok();
            expect(bind.tooltip).to.not.be.ok();
            // teardown
            BasiGX.test.BaseButtonSubClass.prototype.setTooltip = orig;
            btn.destroy();
        });
    });
});
