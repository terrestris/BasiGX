Ext.Loader.syncRequire([
    'BasiGX.view.list.FocusableTreeItem',
    'Ext.list.Tree'
]);

describe('BasiGX.view.list.FocusableTreeItem', function() {
    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.view.list.FocusableTreeItem).to.not.be(undefined);
        });
        it('can be instantiated', function() {
            var item = Ext.create('BasiGX.view.list.FocusableTreeItem');
            expect(item).to.be.a(BasiGX.view.list.FocusableTreeItem);
        });
    });
    describe('Usage inside of a treelist', function() {
        var callback = sinon.spy();
        var div = document.createElement('div');
        document.body.appendChild(div);
        var store = {
            root: {
                expanded: true,
                children: [{
                    text: 'humpty',
                    leaf: true
                }, {
                    text: 'dumpty',
                    leaf: true
                }, {
                    text: 'foobar',
                    leaf: true
                }]
            }
        };
        var treeList = Ext.create('Ext.list.Tree', {
            defaults: {
                // This way our BasiGX class is used
                xtype: 'focusable-tree-item'
            },
            store: store,
            listeners: {
                selectionchange: callback
            },
            renderTo: div
        });
        expect(treeList).to.be.a(Ext.list.Tree);

        it('renders `<li>` elements with `tabIndex` attribute', function() {
            var selector = 'li.x-focusable-tree-item[tabindex]';
            var lis = document.querySelectorAll(selector);
            expect(lis).to.have.length(3);
        });

        describe('ensures treelist `selectionchange` event can be triggered',
            function() {
                var item;
                var target;

                /**
                 * Returns a mock-event as it would have been created by an
                 * actual keydown.
                 *
                 * @param {Number} key The keyCode of the pressed key.
                 * @return {Ext.event.Event} The mocked-up event.
                 */
                var makeEvt = function(key) {
                    return Ext.create('Ext.event.Event', {
                        type: 'keypress',
                        keyCode: key,
                        target: target
                    });
                };

                item = Ext.ComponentQuery.query('focusable-tree-item')[0];
                expect(item).to.be.ok();
                expect(item.onKeyPress).to.be.ok();
                target = item.el.dom;

                it('is triggered on ENTER-key', function() {
                    var evtEnter = makeEvt(Ext.event.Event.ENTER);

                    var cntBefore = callback.callCount;

                    // call into the keyPress method directly
                    item.onKeyPress(evtEnter);

                    expect(callback.callCount).to.be(cntBefore + 1);

                    var call = callback.getCall(callback.callCount - 1);
                    expect(call.args[0]).to.be(treeList);
                    expect(call.args[1]).to.be(item.getNode());
                });

                it('is triggered on SPACE-key', function() {
                    var evtSpace = makeEvt(Ext.event.Event.SPACE);

                    var cntBefore = callback.callCount;

                    // call into the keyPress method directly
                    item.onKeyPress(evtSpace);

                    expect(callback.callCount).to.be(cntBefore + 1);

                    var call = callback.getCall(callback.callCount - 1);
                    expect(call.args[0]).to.be(treeList);
                    expect(call.args[1]).to.be(item.getNode());
                });

                it('is not triggered on A-key', function() {
                    var evtA = makeEvt(Ext.event.Event.A);

                    var cntBefore = callback.callCount;

                    // call into the keyPress method directly
                    item.onKeyPress(evtA);

                    expect(callback.callCount).to.be(cntBefore); // not called
                });
            }
        );
    });
});
