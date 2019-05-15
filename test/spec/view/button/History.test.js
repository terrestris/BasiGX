Ext.Loader.syncRequire(['BasiGX.view.button.History']);

describe('BasiGX.view.button.History', function() {

    var btn;
    var buttonDiv;

    beforeEach(function() {
        // testObjs = TestUtil.setupTestObjects();
        buttonDiv = TestUtil.setupTestDiv();
        btn = Ext.create('BasiGX.view.button.History', {
            renderTo: buttonDiv
        });
    });

    afterEach(function() {
        btn.destroy();
        var parent = buttonDiv && buttonDiv.parentNode;
        if (parent) {
            parent.removeChild(buttonDiv);
        }
    });

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.button.History).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            expect(btn).to.be.a(BasiGX.view.button.History);
        });
    });

    describe('Instantiation', function() {
        it('has the correct default value for "direction"', function() {
            expect(btn.direction).to.be('BACK');
        });

        it('has the correct default value for "mode"', function() {
            expect(btn.mode).to.be('HISTORY');
        });
    });

    describe('History Support', function() {
        Ext.supports.History = false;
        var myBtn = Ext.create('BasiGX.view.button.History');
        it('has the correct value for "mode" when history is not supported',
            function() {
                expect(myBtn.mode).to.be('LEGACY');
            }
        );
        Ext.supports.History = true;
    });

});
