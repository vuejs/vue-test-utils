const webpackConfig = require('./webpack.test.config.js')

if (process.env.CI) {
  // For CI runs, an installation of chrome/chromium is required
  // see https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer for more details
  process.env.CHROME_BIN = require('puppeteer').executablePath()
}

module.exports = config => {
  config.set({
    browsers: [process.env.CI ? 'ChromeHeadlessNoSandbox' : 'Chrome'],
    ...(process.env.CI
      ? {
          customLaunchers: {
            ChromeHeadlessNoSandbox: {
              base: 'ChromeHeadless',
              flags: ['--no-sandbox']
            }
          }
        }
      : {}),
    singleRun: !!process.env.CI,
    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-spec-reporter'
    ],
    basePath: '../../',
    reporters: ['spec'],
    frameworks: ['jasmine'],
    files: ['./test/setup/karma.setup.js', './test/setup/load-tests.js'],
    preprocessors: {
      './test/setup/karma.setup.js': ['webpack'],
      './test/setup/load-tests.js': ['webpack']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  })
}
