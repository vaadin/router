var argv = require('yargs').argv;

// This file is here to mark the project root for WCT.
// (so that when started in this directory it runs for vaadin-router-core, not for vaadin-router)
module.exports = {
  registerHooks: function(context) {
    if (argv.env === 'coverage') {
      context.options.plugins.local.browsers = ['chrome'];

      context.options.plugins.istanbub = {
        dir: './coverage',
        reporters: ['text-summary', 'lcov'],
        include: [
          '**/dist/iife/resolver/matchPath.js',
          '**/dist/iife/resolver/matchRoute.js',
          '**/dist/iife/resolver/resolveRoute.js',
          '**/dist/iife/resolver/resolver.js',
          // '**/dist/iife/resolver/generateUrls.js',
        ],
        exclude: [
          '**/path-to-regexp.js'
        ]
      };
    }
  }
};
