const rollup = require('rollup').rollup
const flow = require('rollup-plugin-flow-no-whitespace')
const resolve = require('path').resolve
const buble = require('rollup-plugin-buble')

rollup({
  entry: resolve('src/index.js'),
  dest: resolve('dist/vue-test-utils.js'),
  plugins: [
    flow(),
    buble({
      objectAssign: 'Object.assign'
    })
  ]
}).then(bundle => {
  bundle.write({
    dest: resolve('dist/vue-test-utils.js'),
    format: 'es'
  })
})
    .then(() => console.log('Build successful'))
.catch(err => {
  console.error(err)
})
