const resolve = require('path').resolve

module.exports = [
  {
    dest: resolve('dist/vue-test-utils.js'),
    format: 'cjs'
  },
  {
    name: 'globals',
    dest: resolve('dist/vue-test-utils.iife.js'),
    moduleName: 'vueTestUtils',
    format: 'iife',
    globals: {
      'vue': 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    }
  },
  {
    dest: resolve('dist/vue-test-utils.umd.js'),
    format: 'umd',
    globals: {
      'vue': 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    },
    moduleName: 'vueTestUtils'
  }
]
