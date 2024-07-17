Ext.Loader.syncRequire(['BasiGX.view.form.AddArcGISRest', 'Ext.Promise']);

describe('BasiGX.view.form.AddArcGISRest', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.AddArcGISRest).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var inst = Ext.create('BasiGX.view.form.AddArcGISRest');
            expect(inst).to.be.a(BasiGX.view.form.AddArcGISRest);
            // teardown
            inst.destroy();
        });
    });

    describe('Rendering', function() {
        var form = null;
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.AddArcGISRest', {
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
            expect(form).to.be.a(BasiGX.view.form.AddArcGISRest);
        });
        it('id attribute looks as expected', function() {
            var gotId = form.getEl().id;
            expect(/^basigx-form-addarcgisrest/.test(gotId)).to.be(true);
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

        it('renders the textfield if no arcGISBaseUrls', function() {
            var textfield = form.down('textfield[name="url"]');
            var combo = form.down('combo[name="urlCombo"]');
            expect(textfield.isVisible()).to.be(true);
            expect(combo.isVisible()).to.be(false);
        });

        it('renders the combo if some arcGISBaseUrls', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddArcGISRest', {
                renderTo: Ext.getBody(),
                arcGISBaseUrls: ['foo', 'fighter']
            });
            var textfield = form.down('textfield[name="url"]');
            var combo = form.down('combo[name="urlCombo"]');
            expect(textfield.isVisible()).to.be(false);
            expect(combo.isVisible()).to.be(true);
        });

        it('can be configured with a default URL (textfield)', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddArcGISRest', {
                renderTo: Ext.getBody(),
                defaultUrl: 'Peter'
            });
            var textfield = form.down('textfield[name="url"]');
            expect(textfield.getValue()).to.be('Peter');
        });

        it('can be configured with a default URL (combo)', function() {
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddArcGISRest', {
                renderTo: Ext.getBody(),
                defaultUrl: 'Kalle'
            });
            var combo = form.down('combo[name="urlCombo"]');
            expect(combo.getValue()).to.be('Kalle');
        });

    });

    describe('Methods', function() {
        var form = null;
        var layers = [{
            service: {
                name: 'Copernicus/HighResolutionLayers',
                type: 'MapServer'
            },
            url: 'https://gis.epa.ie/arcgis/rest/services/Copernicus?f=json'
        },{
            service: {
                name: 'Copernicus/HotSpotMonitoring',
                type: 'MapServer'
            },
            url: 'https://gis.epa.ie/arcgis/rest/services/Copernicus?f=json'
        }];
        beforeEach(function() {
            form = Ext.create('BasiGX.view.form.AddArcGISRest', {
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
        describe('checkAllLayers / uncheckAllLayers', function() {
            it('checks and unchecks all layers', function() {
                function isAllChecked(trees) {
                    return Ext.Array.every(trees, function (tree) {
                        return tree.getStore().getAt(0).get('checked');
                    });
                }

                form.fillAvailableLayersFieldset(layers);
                var trees = form.query('[name=fs-available-layers] basigx-tree-arcgisrestservicetree');
                expect(isAllChecked(trees)).to.be(true);

                form.uncheckAllLayers();
                expect(isAllChecked(trees)).to.be(false);

                form.checkAllLayers();
                expect(isAllChecked(trees)).to.be(true);
            });
        });
    });

    describe('Behaviour', function() {
        var form = null;
        var xhr;
        var requests;
        beforeEach(function() {
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function(xhr) {
                requests.push(xhr);
            };
            form = Ext.create('BasiGX.view.form.AddArcGISRest', {
                renderTo: Ext.getBody()
            });
        });
        afterEach(function() {
            xhr.restore();
            //requests = [];
            if (form) {
                form.destroy();
                form = null;
            }
        });

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function fakeXhrResponse(path) {
            const res = await fetch(path);
            const json = await res.text();
            requests[requests.length - 1].respond(200, { 'Content-Type': 'application/json' }, json);
            // allow time for Extjs to render UI items
            await sleep(10);
        }

        it('fetches root services and creates checkboxgroups', async function() {
            var spy = sinon.spy(form, 'requestLayers');
            form.down('[name="url"]').setValue('https://test.com/services/service');
            form.down('[name="requestLayersBtn"]').click();
            await fakeXhrResponse('/resources/arcgis/services.json');

            var checkboxes = form.query('basigx-tree-arcgisrestservicetree');
            expect(checkboxes.length).to.be(1);
            expect(spy.called).to.be(true);
        });

        it('fetches services and creates checkboxgroups', async function() {
            var spy = sinon.spy(form, 'requestLayers');
            form.down('[name="url"]').setValue('https://test.com/services/service');
            form.down('[name="requestLayersBtn"]').click();
            await fakeXhrResponse('/resources/arcgis/copernicus.json');

            var checkboxes = form.query('basigx-tree-arcgisrestservicetree');
            expect(checkboxes.length).to.be(2);
            expect(spy.called).to.be(true);
        });

        it('fetches layers and populates checkboxgroups when a checkboxgroup is expanded', async function() {
            var spy = sinon.spy(form, 'requestLayer');
            form.down('[name="url"]').setValue('https://test.com/services/service');
            form.down('[name="requestLayersBtn"]').click();
            await fakeXhrResponse('/resources/arcgis/copernicus.json');

            var tree = form.down('basigx-tree-arcgisrestservicetree');
            tree.expandNode(tree.getStore().getAt(0));
            await fakeXhrResponse('/resources/arcgis/copernicus-hotspotmonitoring-mapServer.json');

            expect(tree.getStore().getAt(0).childNodes.length).to.be(14);
            expect(spy.called).to.be(true);
        });

        it('adds checked layers', async function() {
            var spy = sinon.spy();
            form.down('[name="url"]').setValue('https://test.com/services/service');
            form.down('[name="requestLayersBtn"]').click();
            await fakeXhrResponse('/resources/arcgis/copernicus.json');

            var tree = form.down('basigx-tree-arcgisrestservicetree');
            tree.expandNode(tree.getStore().getAt(0));
            await fakeXhrResponse('/resources/arcgis/copernicus-hotspotmonitoring-mapServer.json');

            form.down('[name=add-checked-layers]').click();

            // monitor arcgisrestadd events
            form.on('arcgisrestadd', spy);

            // respond again with layer info since createOlLayerFromArcGISRest calls the service url again
            // two layers are checked so two xhr requests are created in quick succession
            // requests are created
            const res = await fetch('/resources/arcgis/copernicus-hotspotmonitoring-mapServer.json');
            const json = await res.text();
            requests[requests.length - 2].respond(200, { 'Content-Type': 'application/json' }, json);
            requests[requests.length - 1].respond(200, { 'Content-Type': 'application/json' }, json);
            await sleep(10);

            // two layers added, means two arcgisrestadd events fired
            expect(spy.callCount).to.be(2);
        });

        it('handles service call errors', async function() {
            var spy = sinon.spy(form, 'onGetServicesFailure');
            var codes = [0, 400, 401, 403, 404, 429, 500, 503, 504, 505];
            var count = 0;
            for (var code of codes) {
                form.down('[name="url"]').setValue('https://test.com/services/service');
                form.down('[name="requestLayersBtn"]').click();
                requests[requests.length - 1].respond(code);
                count++;
                await sleep(10);
                expect(spy.callCount).to.be(count);
            }
        });

        it('handles arcgis rest errors', async function() {
            // doesn't seem to be an easy way to check if the warn dialog is present
            // instead check the getErrorMessage is called along with onGetServicesSuccess
            // this means the response is 200 but body has an arcgis rest error
            var spy1 = sinon.spy(form, 'onGetServicesSuccess');
            var spy2 = sinon.spy(form, 'getErrorMessage');

            form.down('[name="url"]').setValue('https://test.com/services/service');
            form.down('[name="requestLayersBtn"]').click();
            requests[requests.length - 1].respond(
                200,
                { 'Content-Type': 'application/json' },
                '{"error":{"code":404,"message":"Folder not found","details":[]}}');
            await sleep(10);

            expect(spy1.callCount).to.be(1);
            expect(spy2.callCount).to.be(1);
        });

        it('resets ui and state on reset button click', async function() {
            // populate the ui
            form.down('[name="url"]').setValue('https://test.com/services/service');
            form.down('[name="requestLayersBtn"]').click();
            await fakeXhrResponse('/resources/arcgis/services.json');
            var fs = form.down('[name=fs-available-layers]');

            // verify available-layers is show, then click reset
            expect(fs.hidden).to.be(false);
            form.down('[name="resetFormBtn"]').click();

            // verify available-layers is hidden and url textbox has been reset
            expect(form.down('[name="url"]').getValue()).to.not.be('https://test.com/services/service');
            expect(fs.hidden).to.be(true);
        });
    });
});
