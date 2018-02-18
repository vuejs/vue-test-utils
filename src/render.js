// @flow

import Vue from 'vue'
import createInstance from './lib/create-instance'
import './lib/polyfills/object-assign-polyfill'
const renderer = require('vue-server-renderer').createRenderer()
import { throwError } from './lib/util'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function render (component: Component, options: Options = {}): VueWrapper {
  // Remove cached constructor
  delete component._Ctor

  if (options.attachToDocument) {
    throwError('you cannot use attachToDocument with render')
  }

  const vm = createInstance(component, options)

  let string
  renderer.renderToString(vm, (err, res) => {
    if (err) {
      throwError(err)
    }
    string = res
  })
  return string
}
