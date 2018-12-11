Ext.Loader.syncRequire(['BasiGX.view.form.CsvImport']);

describe('BasiGX.view.form.CsvImport', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.form.CsvImport).to.not.be(undefined);
        });

        it('can be instantiated', function() {
            var store = Ext.create('Ext.data.Store', {
                fields:['a'],
                data: [{ a: 'foo' }]
            });

            var grid = Ext.create('Ext.grid.Panel', {
                store: store,
                columns: [
                    { text: 'A', dataIndex: 'a' }
                ]
            });
            var inst = Ext.create('BasiGX.view.form.CsvImport', {
                grid: grid
            });
            expect(inst).to.be.a(BasiGX.view.form.CsvImport);
            // teardown
            TestUtil.destroyAll(inst, grid, store);
        });
    });
});
