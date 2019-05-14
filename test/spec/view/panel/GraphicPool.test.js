Ext.Loader.syncRequire(['BasiGX.view.panel.GraphicPool']);

describe('BasiGX.view.panel.GraphicPool', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.panel.GraphicPool).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var old = BasiGX.util.Url.getWebProjectBaseUrl;
            BasiGX.util.Url.getWebProjectBaseUrl = function() {
                return '';
            }; // TODO the view/GraphicPool should be refactored!
            var cfg = {
                backendUrls: {
                    pictureList: {
                        url: '/resources/pictures/list.json'
                    },
                    pictureSrc: {
                        url: '/resources/pictures/'
                    }
                }
            };
            var inst = Ext.create('BasiGX.view.panel.GraphicPool', cfg);
            expect(inst).to.be.a(BasiGX.view.panel.GraphicPool);
            // teardown
            inst.destroy();
            BasiGX.util.Url.getWebProjectBaseUrl = old;
        });
    });
});
