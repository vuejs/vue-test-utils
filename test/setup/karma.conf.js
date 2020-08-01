const webpackConfig = require('./webpack.test.config.js')

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec'],
    files: [
      '../../node_modules/@babel/polyfill/dist/polyfill.js',
      './polyfills.js',
      'load-tests.js'
    ],
    preprocessors: {
      'load-tests.js': ['webpack', 'sourcemap']
    },
    client: { mocha: { timeout: 20000 } },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    }
  })
}
