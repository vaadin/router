var argv = require('yargs').argv;

module.exports = {
  registerHooks: function(context) {
    var saucelabsPlatforms = [
      'macOS 10.12/iphone@10.3',
      'macOS 10.12/ipad@11.0',
      'Windows 10/microsoftedge@15',
      'Windows 10/internet explorer@11',
      'macOS 10.12/safari@11.0',
      'macOS 9.3.2/iphone@9.3'
    ];

    var cronPlatforms = [
      'Android/chrome',
      'Windows 10/chrome@59',
      'Windows 10/firefox@54'
    ];

    if (argv.env === 'saucelabs') {
      context.options.plugins.sauce.browsers = saucelabsPlatforms;

    } else if (argv.env === 'saucelabs-cron') {
      context.options.plugins.sauce.browsers = cronPlatforms;
    }

    if (argv.profile === 'coverage') {
      context.options.plugins.local.browsers = ['chrome'];

      context.options.plugins.istanbub = {
        dir: './coverage',
        reporters: ['text-summary', 'lcov'],
        include: [
          '**/*.html',
        ],
        exclude: [
          '**/dist/**/*.js'
        ],
        // TODO(vlukashov): set to 80% when start working on <vaadin-router>
        thresholds: {
          global: {
            statements: 50,
            branches: 50,
            functions: 50,
            lines: 50,
          }
        }
      };
    }
  },
};
