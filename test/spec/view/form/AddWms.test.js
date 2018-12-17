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
            if(form) {
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
            form.destroy();
            form = Ext.create('BasiGX.view.form.AddWms', {
                renderTo: Ext.getBody()
            });
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
    });
});
