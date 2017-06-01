const nodeExternals = require('webpack-node-externals')
const browser = process.env.TARGET === 'browser'
const path = require('path')

const projectRoot = path.resolve(__dirname, '../../../')

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
  target: !browser ? 'node' : undefined,
  externals: !browser ? [nodeExternals()] : undefined,
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devtool: '#eval-source-map'
}
