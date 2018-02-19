// @flow

import Vue from 'vue'
import createInstance from './lib/create-instance'
import './lib/polyfills/object-assign-polyfill'
import { throwError } from './lib/util'
import { runningInNode } from './lib/util'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function renderToString (component: Component, options: Options = {}): string {
  if (!runningInNode) {
    throwError('renderToString must be run in node. It cannot be run in a browser')
  }
  const renderer = require('vue-server-renderer').createRenderer()
  // Remove cached constructor
  delete component._Ctor

  if (options.attachToDocument) {
    throwError('you cannot use attachToDocument with renderToString')
  }

  const vm = createInstance(component, options)

  let renderedString = ''

  renderer.renderToString(vm, (err, res) => {
    if (err) {
      console.log(err)
    }
    renderedString = res
  })
  return renderedString
}
