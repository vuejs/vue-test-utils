// @flow

import './lib/warn-if-no-window'
import Vue from 'vue'
import VueWrapper from './wrappers/vue-wrapper'
import createInstance from './lib/create-instance'
import createElement from './lib/create-element'
import './lib/polyfills/matches-polyfill'
import './lib/polyfills/object-assign-polyfill'
import errorHandler from './lib/error-handler'

Vue.config.productionTip = false
Vue.config.errorHandler = errorHandler
Vue.config.devtools = false

export default function mount (component: Component, options: Options = {}): VueWrapper {
  // Remove cached constructor
  delete component._Ctor

  const vm = createInstance(component, options)

  if (options.attachToDocument) {
    vm.$mount(createElement())
  } else {
    vm.$mount()
  }

  if (vm._error) {
    throw (vm._error)
  }

  return new VueWrapper(vm, { attachedToDocument: !!options.attachToDocument })
}
