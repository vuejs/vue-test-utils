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
    exclude: /node_modules\/(?!(shared|create-instance)\/).*/
  }
)

module.exports = {
  module: {
    rules
  },
  externals: !browser ? [nodeExternals()] : undefined,
  resolve: {
    alias: {
      '~vue/server-test-utils': `${projectRoot}/packages/server-test-utils/dist/vue-server-test-utils.js`,
      '~vue/test-utils': `${projectRoot}/packages/test-utils/dist/vue-test-utils.js`,
      '~resources': `${projectRoot}/test/resources`
    }
  },
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  devtool: '#inline-cheap-module-source-map',
  node: {
    fs: 'empty',
    module: 'empty'
  }
}
