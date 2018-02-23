const webpackConfig = require('./webpack.test.config.js')

module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec'],
    files: [
      '../../node_modules/babel-polyfill/dist/polyfill.js',
      'load-tests.js'
    ],
    preprocessors: {
      'load-tests.js': ['webpack', 'sourcemap']
    },
    client: { mocha: { timeout: 20000 }},
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  })
}
