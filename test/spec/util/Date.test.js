Ext.Loader.syncRequire(['BasiGX.util.Date']);

describe('BasiGX.util.Date', function() {
    var clazz = BasiGX.util.Date;

    describe('Basics', function() {
        it('is defined', function() {
            expect(clazz).to.not.be(undefined);
        });
    });

    describe('Static methods', function() {
        describe('#latestTimeOfDay', function() {
            it('is a defined function', function() {
                expect(clazz.latestTimeOfDay).to.be.a('function');
            });
            it('doesn\'t change the input', function() {
                var inDate = new Date();
                var compareDate = Ext.Date.clone(inDate);
                clazz.latestTimeOfDay(inDate);
                expect(inDate).to.eql(compareDate);
            });
            it('keeps the year from the input', function() {
                var inDate = new Date();
                var got = clazz.latestTimeOfDay(inDate);
                expect(got.getYear()).to.be(inDate.getYear());
            });
            it('keeps the month from the input', function() {
                var inDate = new Date();
                var got = clazz.latestTimeOfDay(inDate);
                expect(got.getMonth()).to.be(inDate.getMonth());
            });
            it('keeps the day from the input', function() {
                var inDate = new Date();
                var got = clazz.latestTimeOfDay(inDate);
                expect(got.getDay()).to.be(inDate.getDay());
            });
            it('sets the hours of the passed date to 23', function() {
                var inDate = new Date();
                var got = clazz.latestTimeOfDay(inDate);
                expect(got.getHours()).to.be(23);
            });
            it('sets the minutes of the passed date to 59', function() {
                var inDate = new Date();
                var got = clazz.latestTimeOfDay(inDate);
                expect(got.getMinutes()).to.be(59);
            });
            it('sets the seconds of the passed date to 59', function() {
                var inDate = new Date();
                var got = clazz.latestTimeOfDay(inDate);
                expect(got.getSeconds()).to.be(59);
            });
            it('sets the milliseconds of the passed date to 999', function() {
                var inDate = new Date();
                var got = clazz.latestTimeOfDay(inDate);
                expect(got.getMilliseconds()).to.be(999);
            });
        });

        describe('#selectedDateStringToRealDate', function() {
            it('is a defined function', function() {
                expect(clazz.selectedDateStringToRealDate).to.be.a('function');
            });
            it('turns a string to date', function() {
                var got = clazz.selectedDateStringToRealDate('11/28/2002');
                expect(Ext.Date.defaultFormat).to.be('m/d/Y');
                expect(got.getFullYear()).to.be(2002);
                expect(got.getMonth()).to.be(10); // January is 0
                expect(got.getDate()).to.be(28);
            });
            it('handles m/d/Y with two digit year', function() {
                var got = clazz.selectedDateStringToRealDate('11/28/02');
                expect(Ext.Date.defaultFormat).to.be('m/d/Y');
                expect(got.getFullYear()).to.be(2002);
                expect(got.getMonth()).to.be(10); // January is 0
                expect(got.getDate()).to.be(28);
            });
        });
    });
});
