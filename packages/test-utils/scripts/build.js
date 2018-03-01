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

const rollupOptionsBuild = [
  {
    file: 'dist/vue-test-utils.js',
    format: 'cjs'
  },
  {
    file: 'dist/vue-test-utils.iife.js',
    format: 'iife',
    name: 'VueTestUtils',
    globals: {
      'vue': 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    }
  },
  {
    file: 'dist/vue-test-utils.umd.js',
    format: 'umd',
    name: 'VueTestUtils',
    globals: {
      'vue': 'Vue',
      'vue-template-compiler': 'VueTemplateCompiler'
    },
    moduleName: 'vueTestUtils'
  }
]

const rollupOptionsTest = [
  {
    file: 'dist/vue-test-utils.js',
    format: 'cjs',
    sourcemap: 'inline'
  }
]

const rollupOptions = process.env.NODE_ENV === 'test' ? rollupOptionsTest : rollupOptionsBuild

rollupOptions.forEach(options => {
  rollup({
    input: resolve('src/index.js'),
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
    bundle.write(options)
  })
    .then(() => success(`${options.format} build successful`))
    .catch((err) => {
      error(err)
    })
})
