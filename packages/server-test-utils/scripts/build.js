const rollup = require('rollup').rollup
const flow = require('rollup-plugin-flow-no-whitespace')
const resolve = require('path').resolve
const buble = require('rollup-plugin-buble')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const chalk = require('chalk')
const json = require('rollup-plugin-json')

function success (text) {
  console.log(chalk.green(`${text} ✔`))
}

function error (text) {
  console.log(chalk.red(`${text} ✘`))
}

const rollupOptionsBuild = [
  {
    file: 'dist/vue-server-test-utils.js',
    format: 'cjs'
  }
]

const rollupOptionsTest = [
  {
    file: 'dist/vue-server-test-utils.js',
    format: 'cjs',
    sourcemap: 'inline'
  }
]

const rollupOptions = process.env.NODE_ENV === 'test'
  ? rollupOptionsTest
  : rollupOptionsBuild

rollupOptions.forEach(options => {
  rollup({
    input: resolve('src/index.js'),
    external: [
      'vue',
      'vue-template-compiler',
      'vue-server-renderer',
      'cheerio',
      '@vue/test-utils'
    ],
    plugins: [
      flow(),
      json(),
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
      process.exit(1)
    })
})
