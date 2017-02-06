Ext.Loader.syncRequire([
    'BasiGX.plugin.AccessibleTitle',
    'Ext.panel.Panel'
]);

describe('BasiGX.plugin.AccessibleTitle', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.plugin.AccessibleTitle).to.not.be(undefined);
        });
        it('can be instantiated', function(){
            var plugin = Ext.create('BasiGX.plugin.AccessibleTitle');
            expect(plugin).to.be.a(BasiGX.plugin.AccessibleTitle);
            plugin.destroy();
        });
    });

    describe('Adding the plugin to a panel', function() {
        var cntH2Before = 0;
        var cntH4Before = 0;
        var panel = null;
        var plugin = null;
        beforeEach(function() {
            cntH2Before = document.querySelectorAll('h2').length;
            cntH4Before = document.querySelectorAll('h4').length;
            panel = Ext.create('Ext.panel.Panel', {
                plugins: ['a11ytitle'],
                title: 'Humpty Foo',
                renderTo: Ext.getBody()
            });
            plugin = panel.getPlugin('a11ytitle');
        });
        afterEach(function() {
            if (panel && panel.destroy) {
                panel.destroy();
            }
            panel = null;
            plugin = null;
            cntH2Before = 0;
            cntH4Before = 0;
        });

        it('renders an h2-header', function() {
            var cntH2After = document.querySelectorAll('h2').length;
            expect(cntH2After).to.be(cntH2Before + 1);
        });
        it('sets the title into h2-header', function() {
            var innerHtmlH2 = plugin.addedHtmlHeader.innerHTML;
            expect(innerHtmlH2).to.be(panel.getTitle());
        });
        it('updates the HTML when panel title changes', function() {
            var innerHtmlBefore = plugin.addedHtmlHeader.innerHTML;

            panel.setTitle('Dumpty Bar');

            var innerHtmlAfter = plugin.addedHtmlHeader.innerHTML;

            expect(innerHtmlAfter).to.not.be(innerHtmlBefore);
            expect(innerHtmlAfter).to.be('Dumpty Bar');
        });
        it('changes the level in the DOM (i.e. `4` becomes `h4`)', function() {
            var cntH2After = document.querySelectorAll('h2').length;
            expect(cntH2After).to.be(cntH2Before + 1);

            plugin.setA11yHeadingLevel(4);

            cntH2After = document.querySelectorAll('h2').length;
            expect(cntH2After).to.be(cntH2Before);

            var cntH4After = document.querySelectorAll('h4').length;
            expect(cntH4After).to.be(cntH4Before + 1);
        });
        it('ensures the added HTML is invisible', function(){
            var elem = Ext.get(plugin.addedHtmlHeader);
            expect(elem.isVisible()).to.be(false);
        });
        it('removes added DOM elements when panel is destroyed', function() {
            panel.destroy();
            var cntH2After = document.querySelectorAll('h2').length;
            expect(cntH2After).to.be(cntH2Before);
        });
        it('plugin contains a reference to the panel', function() {
            expect(plugin.getCmp()).to.be(panel);
        });
        it('also works when panel has `header: false`', function() {
            // setup
            var panel2 = Ext.create('Ext.panel.Panel', {
                plugins: ['a11ytitle'],
                title: 'Will it blend?',
                renderTo: Ext.getBody(),
                header: false
            });
            var plugin2 = panel2.getPlugin('a11ytitle');

            expect(plugin2.addedHtmlHeader.innerHTML).to.be('Will it blend?');

            // teardown
            panel2.destroy();
        });
    });
});
