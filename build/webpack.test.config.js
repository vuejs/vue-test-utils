const nodeExternals = require('webpack-node-externals')
const browser = process.env.TARGET === 'browser'
const path = require('path')

const projectRoot = path.resolve(__dirname, '../')

module.exports = {
  module: {
    rules: [
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
    ]
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
