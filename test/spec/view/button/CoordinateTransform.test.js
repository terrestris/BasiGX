Ext.Loader.syncRequire(['BasiGX.view.button.CoordinateTransform']);

describe('BasiGX.view.button.CoordinateTransform', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.CoordinateTransform).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var btn = Ext.create('BasiGX.view.button.CoordinateTransform');
            expect(btn).to.be.a(BasiGX.view.button.CoordinateTransform);
            // teardown
            btn.destroy();
        });
        it('can be rendered', function() {
            var btn = Ext.create('BasiGX.view.button.CoordinateTransform', {
                renderTo: Ext.getBody(),
                coordinateSystemsToUse: [
                    {code: 'EPSG:4326', name: 'WGS84'}
                ]
            });
            expect(btn).to.be.a(BasiGX.view.button.CoordinateTransform);
            // teardown
            btn.destroy();
        });
    });

    describe('Behaviour', function() {
        it('shows a BasiGX.view.form.CoordinateTransform in a window on click',
            function() {
                var btn = Ext.create('BasiGX.view.button.CoordinateTransform', {
                    renderTo: Ext.getBody(),
                    coordinateSystemsToUse: [
                        {code: 'EPSG:4326', name: 'WGS84'}
                    ]
                });
                btn.click();
                var wins = Ext.ComponentQuery.query(
                    'window[name=coordinate-transform-window]'
                );
                expect(wins.length).to.be(1);
                var forms = wins[0].query('basigx-form-coordinatetransform');
                expect(forms.length).to.be(1);
                Ext.each(wins, function(w) {
                    w.close();
                });
                // teardown
                btn.destroy();
            }
        );

        it('only opens one window on multiple click', function() {
            var btn = Ext.create('BasiGX.view.button.CoordinateTransform', {
                renderTo: Ext.getBody(),
                coordinateSystemsToUse: [
                    {code: 'EPSG:4326', name: 'WGS84'}
                ]
            });
            btn.click();
            btn.click();
            btn.click();
            var wins = Ext.ComponentQuery.query(
                'window[name=coordinate-transform-window]'
            );
            expect(wins.length).to.be(1);
            var forms = wins[0].query('basigx-form-coordinatetransform');
            expect(forms.length).to.be(1);
            expect(btn._win === wins[0]);
            Ext.each(wins, function(w) {
                w.close();
            });
            expect(btn._win === null);
            // teardown
            btn.destroy();
        });

        it('cleans up an opened window on close', function() {
            var btn = Ext.create('BasiGX.view.button.CoordinateTransform', {
                renderTo: Ext.getBody(),
                coordinateSystemsToUse: [
                    {code: 'EPSG:4326', name: 'WGS84'}
                ]
            });
            btn.click();
            var wins = Ext.ComponentQuery.query(
                'window[name=coordinate-transform-window]'
            );
            expect(wins.length).to.be(1);
            Ext.each(wins, function(w) {
                w.close();
            });
            wins = Ext.ComponentQuery.query(
                'window[name=coordinate-transform-window]'
            );
            expect(wins.length).to.be(0);
            expect(btn._win === null);
            // teardown
            btn.destroy();
        });
    });
});
