const rollup = require('rollup').rollup
const flow = require('rollup-plugin-flow-no-whitespace')
const resolve = require('path').resolve
const buble = require('rollup-plugin-buble')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const chalk = require('chalk')

function success (text) {
  console.log(chalk.green(`${text} ✔`))
}

function error (text) {
  console.log(chalk.red(`${text} ✘`))
}

rollup({
  entry: resolve('src/index.js'),
  plugins: [
    flow(),
    buble({
      objectAssign: 'Object.assign'
    })
  ]
}).then(bundle => {
  bundle.write({
    dest: resolve('dist/vue-test-utils.js'),
    format: 'cjs'
  })
})
  .then(() => success('commonjs build successful'))
  .catch((err) => {
    error(err)
  })

rollup({
  entry: resolve('src/index.js'),
  external: ['vue', 'vue-template-compiler'],
  plugins: [
    flow(),
    buble({
      objectAssign: 'Object.assign'
    }),
    nodeResolve(),
    commonjs()
  ]
}).then(bundle => {
  bundle.write({
    name: 'globals',
    dest: resolve('dist/vue-test-utils.iife.js'),
    moduleName: 'vueTestUtils',
    format: 'iife',
    globals: {
      'vue': 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    }
  })
})
  .then(() => success('IIFE build successful'))
  .catch((err) => {
    error(err)
  })

rollup({
  entry: resolve('src/index.js'),
  external: ['vue', 'vue-template-compiler'],
  plugins: [
    flow(),
    buble({
      objectAssign: 'Object.assign'
    }),
    nodeResolve(),
    commonjs()
  ]
}).then((bundle) => {
  bundle.write({
    dest: resolve('dist/vue-test-utils.amd.js'),
    format: 'amd',
    globals: {
      'vue': 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    }
  })
})
  .then(() => success('AMD build successful'))
  .catch((err) => {
    error(err)
  })

rollup({
  entry: resolve('src/index.js'),
  external: ['vue', 'vue-template-compiler'],
  plugins: [
    flow(),
    buble({
      objectAssign: 'Object.assign'
    }),
    nodeResolve(),
    commonjs()
  ]
}).then((bundle) => {
  bundle.write({
    dest: resolve('dist/vue-test-utils.umd.js'),
    format: 'umd',
    globals: {
      'vue': 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    },
    moduleName: 'vueTestUtils'
  })
})
  .then(() => success('UMD build successful'))
  .catch((err) => {
    error(err)
  })
