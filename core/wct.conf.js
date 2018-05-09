var argv = require('yargs').argv;

// This file is here to mark the project root for WCT.
// (so that when started in this directory it runs for vaadin-router-core, not for vaadin-router)
module.exports = {
  registerHooks: function(context) {
    if (argv.profile === 'coverage') {
      context.options.suites = [
        'test/index.coverage.html'
      ];

      context.options.plugins.local.browsers = ['chrome'];

      context.options.plugins.istanbub = {
        dir: './coverage',
        reporters: ['text-summary', 'lcov'],
        include: [
          '**/dist/test-iife/**/*.js',
        ],
        exclude: [
          '**/dist/test-iife/resolver/path-to-regexp.js',
          '**/dist/test-iife/resolver/generateUrls.js',
          '**/dist/test-iife/triggers/click.js',
        ],
        thresholds: {
          global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
          }
        }
      };
    }
  }
};
