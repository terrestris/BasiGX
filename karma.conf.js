/* eslint-disable */
module.exports = function(config) {

    var files = [
        'https://cdnjs.cloudflare.com/ajax/libs/openlayers/4.6.4/ol.js',
        'https://cdnjs.cloudflare.com/ajax/libs/extjs/6.2.0/ext-all.js',
        'https://cdnjs.cloudflare.com/ajax/libs/extjs/6.2.0/packages/ux/classic/ux.js',
        'https://geoext.github.io/geoext3/master/GeoExt.js',
        'https://cdnjs.cloudflare.com/ajax/libs/opentype.js/0.6.9/opentype.min.js',
        'https://cdn.jsdelivr.net/gh/highsource/jsonix@2.4.1/dist/Jsonix-min.js',
        'https://cdn.jsdelivr.net/gh/bjornharrtell/jsts@gh-pages/1.4.0/jsts.min.js',
        'https://cdn.jsdelivr.net/gh/highsource/ogc-schemas@2.6.1/scripts/lib/SLD_1_0_0_GeoServer.js',
        'https://cdn.jsdelivr.net/gh/highsource/ogc-schemas@2.6.1/scripts/lib/Filter_1_0_0.js',
        'https://cdn.jsdelivr.net/gh/highsource/ogc-schemas@2.6.1/scripts/lib/GML_2_1_2.js',
        'https://cdn.jsdelivr.net/gh/highsource/w3c-schemas@1.4.0/scripts/lib/XLink_1_0.js',
        'https://cdn.jsdelivr.net/npm/proj4@2.5.0/dist/proj4-src.min.js',
        'src/**/*js',
        'test/test-helper-functions.js',
        'test/**/*js',
        {pattern: 'test/**/*gif', watched: false, included: false, served: true},
        {pattern: 'test/**/*json', watched: false, included: false, served: true}
    ];

    config.set({
        basePath: '.',

        proxies: {
            '/resources': '/base/test/resources',
            '/spec': '/base/test/spec',
            '/BasiGX': '/base/src'
        },

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'expect', 'sinon'],

        // list of files / patterns to load in the browser
        files: files,

        // list of files to exclude
        exclude: [
        ],

        preprocessors: {
            'src/**/*.js': ['coverage']
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [
            // 'Chrome'
            // 'Firefox',
            'Chromium_no_sandbox'
        ],

        customLaunchers: {
            Chromium_no_sandbox: {
                base: 'ChromiumHeadless',
                flags: ['--no-sandbox']
            }
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        // optionally, configure the reporter
        coverageReporter: {
            dir: 'coverage/',
            type: 'json'
        }
    });
};
