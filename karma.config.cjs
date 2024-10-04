const karmaChromeLauncher = require('karma-chrome-launcher');
const karmaCoverage = require('karma-coverage');
const karmaMocha = require('karma-mocha');
const karmaVite = require('karma-vite');
const karmaSpecReporter = require('karma-spec-reporter');

const isCI = !!process.env.CI;
const watch = !!process.argv.find((arg) => arg.includes('watch')) && !isCI;
const coverage = !!process.argv.find((arg) => arg.includes('--coverage'));

module.exports = (config) => {
  config.set({
    basePath: '',

    plugins: [karmaMocha, karmaChromeLauncher, karmaVite, karmaCoverage, karmaSpecReporter],

    browsers: ['ChromeHeadlessNoSandbox'],

    // you can define custom flags
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox', isCI ? undefined : '--disable-dev-shm-usage'].filter(
          Boolean,
        ),
      },
    },

    captureTimeout: 60000, // it was already there
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 60000, //by default 10000

    frameworks: ['vite', 'mocha'],

    files: [
      {
        pattern: 'test/triggers/click.spec.ts',
        type: 'module',
        watched: false,
        served: false,
      },
    ],

    reporters: ['spec', coverage && 'coverage'].filter(Boolean),

    autoWatch: watch,
    singleRun: !watch,

    coverageReporter: {
      dir: '.coverage/',
      reporters: [!isCI && { type: 'html', subdir: 'html' }, { type: 'lcovonly', subdir: '.' }].filter(Boolean),
    },

    vite: {
      autoInit: true,
    },
  });
};
