Ext.Loader.syncRequire(['BasiGX.util.CSRF']);

describe('BasiGX.util.CSRF', function() {
    var tokenValue = 'my-csrf-token-value';
    var headerName = 'my-csrf-header-name';
    var paramName = 'my-csrf-param-name';
    var generated = [];
    var removeGeneratedDom = function() {
        Ext.each(generated, function(generatedElement) {
            if (generatedElement && generatedElement.destroy) {
                generatedElement.destroy();
            }
            generatedElement = null;
        });
        generated = [];
    };
    beforeEach(function() {
        // mockup the expected DOM structure
        var specs = [{
            tag: 'meta',
            name: '_csrf',
            content: tokenValue
        }, {
            tag: 'meta',
            name: '_csrf_header',
            content: headerName
        }, {
            tag: 'meta',
            name: '_csrf_parameter_name',
            content: paramName
        }];
        Ext.each(specs, function(spec) {
            generated.push(Ext.dom.Helper.append(
                Ext.getHead(), spec, true
            ));
        });
    });
    afterEach(removeGeneratedDom);

    describe('Basics', function() {
        it('is defined', function() {
            expect(BasiGX.util.CSRF).to.not.be(undefined);
        });
    });

    describe('Static methods', function() {

        describe('#getValue', function() {
            it('is a defined function', function() {
                expect(BasiGX.util.CSRF.getValue).to.be.ok();
                expect(BasiGX.util.CSRF.getValue).to.be.a('function');
            });
            it('returns the CSRF token', function() {
                var got = BasiGX.util.CSRF.getValue();
                expect(got).to.be(tokenValue);
            });
            it('returns the empty string and warns if DOM is not as expected',
                function() {
                    // setup
                    // cleanup manually, so the DOM does not have the meta tags
                    removeGeneratedDom();
                    var logSpy = sinon.spy(Ext.log, 'warn');

                    var got = BasiGX.util.CSRF.getValue();

                    expect(got).to.be('');
                    expect(logSpy.called).to.be(true);
                    expect(logSpy.callCount).to.be(1);

                    // cleanup
                    Ext.log.warn.restore();
                }
            );
        });

        describe('#getKey', function() {
            it('is a defined function', function() {
                expect(BasiGX.util.CSRF.getKey).to.be.ok();
                expect(BasiGX.util.CSRF.getKey).to.be.a('function');
            });
            it('returns the CSRF header name', function() {
                var got = BasiGX.util.CSRF.getKey();
                expect(got).to.be(headerName);
            });
            it('returns the empty string and warns if DOM is not as expected',
                function() {
                    // setup
                    // cleanup manually, so the DOM does not have the meta tags
                    removeGeneratedDom();
                    var logSpy = sinon.spy(Ext.log, 'warn');

                    var got = BasiGX.util.CSRF.getKey();

                    expect(got).to.be('');
                    expect(logSpy.called).to.be(true);
                    expect(logSpy.callCount).to.be(1);

                    // cleanup
                    Ext.log.warn.restore();
                }
            );
        });

        describe('#getParamName', function() {
            it('is a defined function', function() {
                expect(BasiGX.util.CSRF.getParamName).to.be.ok();
                expect(BasiGX.util.CSRF.getParamName).to.be.a('function');
            });
            it('returns the CSRF parameter name', function() {
                var got = BasiGX.util.CSRF.getParamName();
                expect(got).to.be(paramName);
            });
            it('returns the empty string and warns if DOM is not as expected',
                function() {
                    // setup
                    // cleanup manually, so the DOM does not have the meta tags
                    removeGeneratedDom();
                    var logSpy = sinon.spy(Ext.log, 'warn');

                    var got = BasiGX.util.CSRF.getParamName();

                    expect(got).to.be('');
                    expect(logSpy.called).to.be(true);
                    expect(logSpy.callCount).to.be(1);

                    // cleanup
                    Ext.log.warn.restore();
                }
            );
        });

        describe('#getHeader', function() {
            it('is a defined function', function() {
                expect(BasiGX.util.CSRF.getHeader).to.be.ok();
                expect(BasiGX.util.CSRF.getHeader).to.be.a('function');
            });
            it('returns an object', function() {
                var got = BasiGX.util.CSRF.getHeader();
                expect(got).to.be.an('object');
            });
            it('has a member for the CSRF header name', function() {
                var got = BasiGX.util.CSRF.getHeader();
                expect(headerName in got).to.be(true);
                expect(got[headerName]).to.be.ok();
                expect(got[headerName]).to.be.a('string');
            });
            it('ensures the value at the key is the token', function() {
                var got = BasiGX.util.CSRF.getHeader();
                expect(got[headerName]).to.be(tokenValue);
            });
            it('returns an empty object and warns if DOM is not as expected',
                function() {
                    // setup
                    // cleanup manually, so the DOM does not have the meta tags
                    removeGeneratedDom();
                    var logSpy = sinon.spy(Ext.log, 'warn');

                    var got = BasiGX.util.CSRF.getHeader();

                    expect(got).to.eql({});
                    expect(logSpy.called).to.be(true);
                    expect(logSpy.callCount).to.be(2); // name and value missing

                    // cleanup
                    Ext.log.warn.restore();
                }
            );
        });

        describe('#getDomHelperField', function() {
            it('is a defined function', function() {
                expect(BasiGX.util.CSRF.getDomHelperField).to.be.ok();
                expect(BasiGX.util.CSRF.getDomHelperField).to.be.a('function');
            });
            it('returns an object', function() {
                var got = BasiGX.util.CSRF.getDomHelperField();
                expect(got).to.be.an('object');
            });
            it('returns a spec for a hidden input', function() {
                var got = BasiGX.util.CSRF.getDomHelperField();
                expect(got.tag).to.be('input');
                expect(got.type).to.be('hidden');
            });
            it('ensures the name and value are set correctly', function() {
                var got = BasiGX.util.CSRF.getDomHelperField();
                expect(got.name).to.be(paramName);
                expect(got.value).to.be(tokenValue);
            });
            it('returns hidden input wo/ name&value if DOM is not as expected',
                function() {
                    // setup
                    // cleanup manually, so the DOM does not have the meta tags
                    removeGeneratedDom();
                    var logSpy = sinon.spy(Ext.log, 'warn');

                    var got = BasiGX.util.CSRF.getDomHelperField();

                    expect(got).to.eql({
                        tag: 'input',
                        type: 'hidden'
                    });
                    expect(logSpy.called).to.be(true);
                    expect(logSpy.callCount).to.be(2); // name and value missing

                    // cleanup
                    Ext.log.warn.restore();
                }
            );
        });

    });
});
