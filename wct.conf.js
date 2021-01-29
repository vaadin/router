var argv = require('yargs').argv;

module.exports = {
  registerHooks: function(context) {
    if (argv.env === 'saucelabs') {
      // The list below is based on the browserslist config defined in package.json
      context.options.plugins.sauce.browsers = [
        // last 2 Chrome major versions (desktop)
        'Windows 10/chrome@latest',
        'Windows 10/chrome@latest-1',

        // last 2 Android major versions (mobile Chrome)
        {
          deviceName: 'Android GoogleAPI Emulator',
          platformName: 'Android',
          platformVersion: '11.0',
          browserName: 'chrome',
          browserVersion: 'latest'
        },
        {
          deviceName: 'Android GoogleAPI Emulator',
          platformName: 'Android',
          platformVersion: '10.0',
          browserName: 'chrome',
          browserVersion: 'latest-1'
        },

        // last 2 Firefox major versions (desktop)
        'Windows 10/firefox@latest',
        'Windows 10/firefox@latest-1',

        // last Firefox ESR version (desktop)
        // SauceLabs doesn't have ESR versions so testing
        // the regular release of the same major version here
        'Windows 10/firefox@78.0',

        // last 2 Edge major versions (desktop)
        'Windows 10/microsoftedge@latest',
        'Windows 10/microsoftedge@latest-1',

        // last 2 Safari major versions (desktop)
        'macOS 11.00/safari@latest',
        'macOS 10.15/safari@latest',

        // last 2 iOS major versions (mobile Safari)
        'iOS Simulator/iphone@latest',
        'iOS Simulator/iphone@latest-1',
      ];
    }

    if (argv.profile === 'coverage') {
      context.options.suites = [
        'test/index.coverage.html'
      ];

      context.options.plugins.local.browsers = ['chrome'];

      context.options.plugins.istanbul = {
        dir: './coverage',
        reporters: ['text-summary', 'lcov'],
        include: [
          '**/dist/test-iife/**/*.js',
        ],
        exclude: [
          '**/dist/test-iife/resolver/path-to-regexp.js',
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
