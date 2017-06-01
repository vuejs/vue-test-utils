const webpackConfig = require('./webpack.config')

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'sinon-chai', 'phantomjs-shim'],
    reporters: ['spec', 'coverage'],
    files: ['../specs/**/*.+(vue|js)'],
    preprocessors: {
      '../specs/**/*.+(vue|js)': ['webpack', 'sourcemap']
    },
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
