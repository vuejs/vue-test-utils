const nodeExternals = require('webpack-node-externals')
const browser = process.env.TARGET === 'browser'
const path = require('path')

const projectRoot = path.resolve(__dirname, '../../')
const isCoverage = process.env.NODE_ENV === 'coverage'
const rules = [].concat(
  isCoverage ? {
    test: /\.js/,
    include: path.resolve('dist'),
    loader: 'istanbul-instrumenter-loader'
  } : [],
  {
    test: /\.vue$/,
    loader: 'vue-loader'
  },
  {
    test: /\.js$/,
    loader: 'babel-loader',
    include: [projectRoot],
    exclude: /node_modules/
  }
)

module.exports = {
  module: {
    rules
  },
  externals: !browser ? [nodeExternals()] : undefined,
  resolve: {
    alias: {
      '~src': `${projectRoot}/src`,
      '~resources': `${projectRoot}/test/resources`,
      '~vue-test-utils': `${projectRoot}/dist/vue-test-utils`
    }
  },
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  devtool: '#inline-cheap-module-source-map'
}
