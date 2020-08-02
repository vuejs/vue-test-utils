/**
 * require.context is used in order to build one bundle with karma-webpack.
 * If globstars are used, a bundle is created per glob match.
 * This creates obvious memory issues and is not desired.
 *
 * Please see https://github.com/webpack-contrib/karma-webpack#alternative-usage for more details
 */
const testsContext = require.context('../specs', true, /\.spec\.(js|vue)$/)

testsContext.keys().forEach(testsContext)
