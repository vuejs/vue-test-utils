const webpackConfig = require('../../../build/webpack.test.config.js')

module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec', 'coverage'],
    files: [
      '../../../node_modules/babel-polyfill/dist/polyfill.js',
      '../specs/**/*.+(vue|js)'
    ],
    preprocessors: {
      '../specs/**/*.+(vue|js)': ['webpack', 'sourcemap']
    },
    client: { mocha: { timeout: 20000 }},
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
