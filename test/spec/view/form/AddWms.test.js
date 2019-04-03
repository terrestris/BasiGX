Ext.Loader.syncRequire(['BasiGX.view.form.AddWms']);

describe('BasiGX.view.form.AddWms', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.AddWms).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.AddWms');
            expect(inst).to.be.a(BasiGX.view.form.AddWms);
            // teardown
            inst.destroy();
        });
    });

    describe('Rendering', function() {
        var form = null;
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.AddWms', {
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
            expect(form).to.be.a(BasiGX.view.form.AddWms);
        });
        it('id attribute looks as expected', function() {
            var gotId = form.getEl().id;
            expect(/^basigx-form-addwms/.test(gotId)).to.be(true);
        });
        it('renders both a textfield and a combo by default', function() {
            var textfield = form.down('textfield[name="url"]');
            expect(textfield).to.be.ok();
            expect(textfield).to.be.an(Ext.form.field.Text);

            var combo = form.down('combo[name="urlCombo"]');
            expect(combo).to.be.ok();
            expect(combo).to.be.an(Ext.form.field.ComboBox);
        });

        it('ensures only one of combo/textfield is visible', function() {
            var textfield = form.down('textfield[name="url"]');
            var combo = form.down('combo[name="urlCombo"]');
            expect(textfield.isVisible()).to.not.be(combo.isVisible());
        });

        it('renders the textfield if no wmsBaseUrls', function() {
            var textfield = form.down('textfield[name="url"]');
            var combo = form.down('combo[name="urlCombo"]');
            expect(textfield.isVisible()).to.be(true);
            expect(combo.isVisible()).to.be(false);
        });

        it('renders the combo if some wmsBaseUrls', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddWms', {
                renderTo: Ext.getBody(),
                wmsBaseUrls: ['foo', 'fighter']
            });
            var textfield = form.down('textfield[name="url"]');
            var combo = form.down('combo[name="urlCombo"]');
            expect(textfield.isVisible()).to.be(false);
            expect(combo.isVisible()).to.be(true);
        });

        it('can be configured with a default URL (textfield)', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddWms', {
                renderTo: Ext.getBody(),
                defaultUrl: 'Peter'
            });
            var textfield = form.down('textfield[name="url"]');
            expect(textfield.getValue()).to.be('Peter');
        });

        it('can be configured with a default URL (combo)', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddWms', {
                renderTo: Ext.getBody(),
                defaultUrl: 'Kalle'
            });
            var combo = form.down('combo[name="urlCombo"]');
            expect(combo.getValue()).to.be('Kalle');
        });

        it('has a version selection container by default', function() {
            var versionContainer = form.down('fieldcontainer');
            expect(versionContainer).to.be.ok();
            expect(versionContainer.isVisible()).to.be(true);
        });

        it('hides version selection, if autoDetectVersion=true', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddWms', {
                renderTo: Ext.getBody(),
                autoDetectVersion: true
            });
            var versionContainer = form.down('fieldcontainer');
            expect(versionContainer).to.be.ok();
            expect(versionContainer.isVisible()).to.be(false);
        });

    });

    describe('Initialisation', function() {
        it('creates one parser during initialisation', function() {
            var form = Ext.create('BasiGX.view.form.AddWms');
            expect(form.parser).to.be.ok();
            expect(form.parser).to.be.an(ol.format.WMSCapabilities);
            form.destroy();
            // teardown manually, only one test herein
        });
    });

    describe('Behaviour', function() {
        var form = null;
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.AddWms', {
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
            it('works with 1.3.0', function(done) {
                form.down('[name="url"]').setValue('/resources/ows/service-1.3.0.xml');
                form.down('[name="requestLayersBtn"]').click();

                window.setTimeout(function() {
                    var checkboxes = form.query('[name="fs-available-layers"] checkbox');
                    expect(checkboxes.length).to.be(numExpectedLayers);
                    done();
                }, 50);
            });
            it('works with 1.1.1', function(done) {
                form.down('[name="url"]').setValue('/resources/ows/service-1.1.1.xml');
                form.down('[name="requestLayersBtn"]').click();
                window.setTimeout(function() {
                    var checkboxes = form.query('[name="fs-available-layers"] checkbox');
                    expect(checkboxes.length).to.be(numExpectedLayers);
                    done();
                }, 50);
            });
        });

        describe('selection state determines if a layer can be added', function() {
            var selPrefix = '[name="fs-available-layers"] ';
            var addToMapBtn;
            var checkboxes;
            beforeEach(function(done) {
                if (!form) {
                    form = Ext.create('BasiGX.view.form.AddWms', {
                        renderTo: Ext.getBody()
                    });
                }
                form.down('[name="url"]').setValue('/resources/ows/service-1.3.0.xml');
                form.down('[name="requestLayersBtn"]').click();
                window.setTimeout(function() {
                    addToMapBtn = form.down('button[name="add-checked-layers"]');
                    checkboxes = form.query(selPrefix + 'checkbox');
                    done();
                }, 50);
            });

            afterEach(function() {
                if (form) {
                    form.destroy();
                    form = null;
                }
            });

            it('renders the button initially disabled', function() {
                var checkedCheckboxes = form.query(selPrefix + 'checkbox[checked=true]');
                expect(checkedCheckboxes.length).to.be(0);
                expect(addToMapBtn.isDisabled()).to.be(true);
            });

            it('enables the add to map button if at least one selected', function(done) {
                // check a checkbox, button should be enabled
                checkboxes[0].setValue(true);
                var checkedCheckboxes;
                addToMapBtn = form.down('button[name="add-checked-layers"]');

                window.setTimeout(function() {
                    checkedCheckboxes = form.query(selPrefix + 'checkbox[checked=true]');
                    expect(checkedCheckboxes.length).to.be(1);
                    expect(addToMapBtn.isDisabled()).to.be(false);

                    // check another one
                    checkboxes[1].setValue(true);
                    checkedCheckboxes = form.query(selPrefix + 'checkbox[checked=true]');
                    expect(checkedCheckboxes.length).to.be(2);
                    expect(addToMapBtn.isDisabled()).to.be(false);

                    // uncheck the last, still one checked
                    checkboxes[1].setValue(false);
                    checkedCheckboxes = form.query(selPrefix + 'checkbox[checked=true]');
                    expect(checkedCheckboxes.length).to.be(1);
                    expect(addToMapBtn.isDisabled()).to.be(false);

                    done();
                }, 50);
            });

            it('disables the button as soon as no more are selected', function(done) {
                checkboxes[0].setValue(false);

                window.setTimeout(function() {
                    var checkedCheckboxes = form.query(selPrefix + 'checkbox[checked=true]');
                    addToMapBtn = form.down('button[name="add-checked-layers"]');
                    expect(checkedCheckboxes.length).to.be(0);
                    expect(addToMapBtn.isDisabled()).to.be(true);

                    done();
                }, 50);
            });
        });

        describe('form can be resetted', function() {
            var selPrefix = '[name="fs-available-layers"] ';

            beforeEach(function(done) {
                if (!form) {
                    form = Ext.create('BasiGX.view.form.AddWms', {
                        renderTo: Ext.getBody()
                    });
                }
                form.down('[name="url"]').setValue('/resources/ows/service-1.3.0.xml');
                form.down('[name="requestLayersBtn"]').click();
                window.setTimeout(function() {
                    done();
                }, 50);
            });

            afterEach(function() {
                if (form) {
                    form.destroy();
                    form = null;
                }
            });

            it('removes checkboxes', function(done) {
                var checkboxes = form.query(selPrefix + 'checkbox');
                expect(checkboxes.length > 0).to.be(true);
                form.down('[name="resetFormBtn"]').click();
                window.setTimeout(function() {
                    checkboxes = form.query(selPrefix + 'checkbox');
                    expect(checkboxes.length).to.be(0);
                    done();
                }, 50);
            });

            it('removes add checked layers button', function(done) {
                var btn = form.down('[name="add-checked-layers"]');
                expect(btn).to.be.ok();
                form.down('[name="resetFormBtn"]').click();
                window.setTimeout(function() {
                    btn = form.down('[name="add-checked-layers"]');
                    expect(btn).to.be(null);
                    done();
                }, 50);
            });

            it('resets entered URL to default', function(done) {
                var urlField = form.down('[name="url"]');
                expect(urlField.getValue()).to.be.ok();
                form.down('[name="resetFormBtn"]').click();
                window.setTimeout(function() {
                    urlField = form.down('[name="url"]');
                    expect(urlField.getValue()).to.be(form.getDefaultUrl());
                    done();
                }, 50);
            });
        });
    });

    describe('Methods', function() {
        var form = null;
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.AddWms', {
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
