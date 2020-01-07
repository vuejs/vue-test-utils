/* eslint-disable max-len */

const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')
const browser = process.env.TARGET === 'browser'
const path = require('path')

const projectRoot = path.resolve(__dirname, '../../')

const rules = [].concat(
  {
    test: /\.vue$/,
    loader: 'vue-loader'
  },
  {
    test: /\.js$/,
    loader: 'babel-loader',
    exclude: /node_modules/
  }
)
const externals = nodeExternals({
  // we need to whitelist both `create-instance` and files in `shared` package. Otherwise Webpack wont bundle them in the test dev env
  whitelist: ['create-instance', /^shared\/.*/]
})
// define the default aliases
let aliasedFiles = {
  '~vue/server-test-utils': `@vue/server-test-utils`,
  '~vue/test-utils': `@vue/test-utils`
}
if (process.env.TARGET === 'dev') {
  // if we are in dev test mode, we want to alias all files to the src file, not dist
  aliasedFiles = {
    // we need both as some places import the old alias with ~, others directly test utils package.
    '@vue/server-test-utils': `@vue/server-test-utils/src/index.js`,
    '@vue/test-utils': `@vue/test-utils/src/index.js`,
    '~vue/server-test-utils': `@vue/server-test-utils/src/index.js`,
    '~vue/test-utils': `@vue/test-utils/src/index.js`
  }
}
module.exports = {
  module: {
    rules
  },
  externals: !browser ? [externals] : undefined,
  resolve: {
    alias: {
      ...aliasedFiles,
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
  },
  plugins: [new webpack.EnvironmentPlugin(['TEST_ENV'])]
}
