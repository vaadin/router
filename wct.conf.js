var argv = require('yargs').argv;

module.exports = {
  registerHooks: function(context) {
    if (argv.env === 'saucelabs') {
      // The list below is based on the browserslist config defined in package.json
      context.options.plugins.sauce.browsers = [
        // // last 2 Chrome major versions (desktop)
        'Windows 10/chrome@latest',
        'Windows 10/chrome@latest-1',

        // last 2 Android major versions (mobile Chrome)
        {
          deviceName: 'Android GoogleAPI Emulator',
          platformName: 'Android',
          platformVersion: '7.1',
          browserName: 'chrome',
          browserVersion: 'latest'
        },
        {
          deviceName: 'Android Emulator',
          platformName: 'Android',
          platformVersion: '6.0',
          browserName: 'chrome',
          browserVersion: 'latest-1'
        },

        // last 2 Firefox major versions (desktop)
        'Windows 10/firefox@latest',
        'Windows 10/firefox@latest-1',

        // last 2 Edge major versions (desktop)
        'Windows 10/microsoftedge@latest',
        'Windows 10/microsoftedge@latest-1',

        // last 2 Safari major versions (desktop)
        'macOS 10.13/safari@11.1',
        'macOS 10.12/safari@10.1',

        // last 2 iOS major versions (mobile Safari)
        'iOS Simulator/iphone@12.0',
        'iOS Simulator/iphone@11.0',

        // Safari 9 on desktop and mobile
        'OS X 10.11/safari@9.0',

        // The mobile Safari 9 tests are disabled because they fail due to
        // https://forums.developer.apple.com/thread/36650
        // 'iOS Simulator/iphone@9.3',

        // IE11
        'Windows 7/internet explorer@11',
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
