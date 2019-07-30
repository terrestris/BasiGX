Ext.Loader.syncRequire(['BasiGX.view.form.CSW']);

describe('BasiGX.view.form.CSW', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.CSW).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.CSW');
            expect(inst).to.be.a(BasiGX.view.form.CSW);
            // teardown
            inst.destroy();
        });
    });

    describe('Rendering', function() {
        var form = null;
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.CSW', {
                renderTo: Ext.getBody()
            });
        });
        afterEach(function() {
            if (form) {
                form.destroy();
                form = null;
            }
        });

        it('can be rendered', function() {
            expect(form).to.be.a(BasiGX.view.form.CSW);
        });
        it('id attribute looks as expected', function() {
            var gotId = form.getEl().id;
            expect(/^basigx-form-csw/.test(gotId)).to.be(true);
        });
        it('renders both a textfield and a combo by default', function() {
            var textfield = form.down('textfield[name="cswUrl"]');
            expect(textfield).to.be.ok();
            expect(textfield).to.be.an(Ext.form.field.Text);

            var combo = form.down('combo[name="cswUrlCombo"]');
            expect(combo).to.be.ok();
            expect(combo).to.be.an(Ext.form.field.ComboBox);
        });

        it('ensures only one of combo/textfield is visible', function() {
            var textfield = form.down('textfield[name="cswUrl"]');
            var combo = form.down('combo[name="cswUrlCombo"]');
            expect(textfield.isVisible()).to.not.be(combo.isVisible());
        });

        it('renders the textfield if no cswBaseUrls', function() {
            var textfield = form.down('textfield[name="cswUrl"]');
            var combo = form.down('combo[name="cswUrlCombo"]');
            expect(textfield.isVisible()).to.be(true);
            expect(combo.isVisible()).to.be(false);
        });

        it('renders the combo if some cswBaseUrls', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.CSW', {
                renderTo: Ext.getBody(),
                cswBaseUrls: ['foo', 'fighter']
            });
            var textfield = form.down('textfield[name="cswUrl"]');
            var combo = form.down('combo[name="cswUrlCombo"]');
            expect(textfield.isVisible()).to.be(false);
            expect(combo.isVisible()).to.be(true);
        });

        it('can be configured with a default URL (textfield)', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.CSW', {
                renderTo: Ext.getBody(),
                defaultUrl: 'Peter'
            });
            var textfield = form.down('textfield[name="cswUrl"]');
            expect(textfield.getValue()).to.be('Peter');
        });

        it('can be configured with a default URL (combo)', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.CSW', {
                renderTo: Ext.getBody(),
                defaultUrl: 'Kalle'
            });
            var combo = form.down('combo[name="cswUrlCombo"]');
            expect(combo.getValue()).to.be('Kalle');
        });

    });

    describe('Behaviour', function() {
        var form = null;
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.CSW', {
                renderTo: Ext.getBody()
            });
        });
        afterEach(function() {
            if (form) {
                form.destroy();
                form = null;
            }
        });
        describe('fetches layers of a server', function() {
            var numExpectedLayers = 8;
            it('renders the buttons correctly', function(done) {
                Ext.Ajax.request({
                    url: '/resources/ows/csw-response.xml',
                    method: 'GET',
                    success: function(response) {
                        form.onGetRecordsSuccess(response);
                        window.setTimeout(function() {
                            var buttons = form.query('[name="fs-available-layers"]')[0].items;
                            expect(buttons.length).to.be(numExpectedLayers);
                            done();
                        }, 50);
                    }
                });
            });
        });


        describe('form can be resetted', function() {
            var selPrefix = '[name="fs-available-layers"] ';

            beforeEach(function(done) {
                if (!form) {
                    form = Ext.create('BasiGX.view.form.CSW', {
                        renderTo: Ext.getBody()
                    });
                }
                Ext.Ajax.request({
                    url: '/resources/ows/csw-response.xml',
                    method: 'GET',
                    success: function(response) {
                        form.onGetRecordsSuccess(response);
                        window.setTimeout(function() {
                            done();
                        }, 50);
                    }
                });
            });

            afterEach(function() {
                if (form) {
                    form.destroy();
                    form = null;
                }
            });

            it('removes buttons', function(done) {
                var buttons = form.query(selPrefix + 'button');
                expect(buttons.length > 0).to.be(true);
                form.down('[name="resetFormBtn"]').click();
                window.setTimeout(function() {
                    buttons = form.query(selPrefix + 'button');
                    expect(buttons.length).to.be(0);
                    done();
                }, 50);
            });

            it('resets entered URL to default', function(done) {
                var urlField = form.down('[name="cswUrl"]');
                expect(urlField.getValue()).to.be.ok();
                form.down('[name="resetFormBtn"]').click();
                window.setTimeout(function() {
                    urlField = form.down('[name="cswUrl"]');
                    expect(urlField.getValue()).to.be(form.getDefaultUrl());
                    done();
                }, 50);
            });
        });
    });

    describe('Methods', function() {
        var form = null;
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.CSW', {
                renderTo: Ext.getBody()
            });
        });
        afterEach(function() {
            if (form) {
                form.destroy();
                form = null;
            }
        });
        describe('responseStatusToErrorMsgKey', function() {
            it('returns a key for CORS status', function() {
                var exp = 'msgCorsMisconfiguration';
                expect(form.responseStatusToErrorMsgKey(0)).to.be(exp);
                expect(form.responseStatusToErrorMsgKey('0')).to.be(exp);
                expect(form.getViewModel().get(exp)).to.be.ok();
            });
            it('returns a key for unauthorized error status', function() {
                var exp = 'msgUnauthorized';
                expect(form.responseStatusToErrorMsgKey(401)).to.be(exp);
                expect(form.responseStatusToErrorMsgKey('401')).to.be(exp);
                expect(form.getViewModel().get(exp)).to.be.ok();
            });
            it('returns a key for forbidded error status', function() {
                var exp = 'msgForbidden';
                expect(form.responseStatusToErrorMsgKey(403)).to.be(exp);
                expect(form.responseStatusToErrorMsgKey('403')).to.be(exp);
                expect(form.getViewModel().get(exp)).to.be.ok();
            });
            it('returns a key for file not found error status', function() {
                var exp = 'msgFileNotFound';
                expect(form.responseStatusToErrorMsgKey(404)).to.be(exp);
                expect(form.responseStatusToErrorMsgKey('404')).to.be(exp);
                expect(form.getViewModel().get(exp)).to.be.ok();
            });
            it('returns a key for too many requests error status', function() {
                var exp = 'msgTooManyRequests';
                expect(form.responseStatusToErrorMsgKey(429)).to.be(exp);
                expect(form.responseStatusToErrorMsgKey('429')).to.be(exp);
                expect(form.getViewModel().get(exp)).to.be.ok();
            });
            it('returns a key for service unavailable error status', function() {
                var exp = 'msgServiceUnavailable';
                expect(form.responseStatusToErrorMsgKey(503)).to.be(exp);
                expect(form.responseStatusToErrorMsgKey('503')).to.be(exp);
                expect(form.getViewModel().get(exp)).to.be.ok();
            });
            it('returns a key for gateway timeout error status', function() {
                var exp = 'msgGatewayTimeOut';
                expect(form.responseStatusToErrorMsgKey(504)).to.be(exp);
                expect(form.responseStatusToErrorMsgKey('504')).to.be(exp);
                expect(form.getViewModel().get(exp)).to.be.ok();
            });
            it('returns null for unexpected status', function() {
                var exp = null;
                var checks = [
                    -1, 'humpty', false, NaN, [], {}, function() { }
                ];
                Ext.each(checks, function(check) {
                    expect(form.responseStatusToErrorMsgKey(check)).to.be(exp);
                    expect(form.responseStatusToErrorMsgKey('' + check)).to.be(exp);
                });
            });
        });
        describe('responseStatusToErrorMsgKey', function() {
            it('returns a generic key for client error status', function() {
                var exp = 'msgClientError';
                var checks = [
                    400, 410, 450, 465, 499
                ];
                Ext.each(checks, function(check) {
                    expect(form.responseStatusToErrorMsgKey(check)).to.be(exp);
                    expect(form.responseStatusToErrorMsgKey('' + check)).to.be(exp);
                    expect(form.getViewModel().get(exp)).to.be.ok();
                });
            });
        });
        describe('responseStatusToErrorMsgKey', function() {
            it('returns a generic key for server error status', function() {
                var exp = 'msgServerError';
                var checks = [
                    500, 510, 550, 565, 664, 799
                ];
                Ext.each(checks, function(check) {
                    expect(form.responseStatusToErrorMsgKey(check)).to.be(exp);
                    expect(form.responseStatusToErrorMsgKey('' + check)).to.be(exp);
                    expect(form.getViewModel().get(exp)).to.be.ok();
                });
            });
        });
    });
});
