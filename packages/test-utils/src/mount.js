// @flow

import './warn-if-no-window'
import './matches-polyfill'
import './object-assign-polyfill'
import Vue from 'vue'
import VueWrapper from './vue-wrapper'
import createInstance from 'create-instance'
import createElement from './create-element'
import createLocalVue from './create-local-vue'
import errorHandler from './error-handler'
import { findAllVueComponentsFromVm } from './find-vue-components'
import { mergeOptions } from 'shared/merge-options'
import config from './config'

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.config.errorHandler = errorHandler

export default function mount (component: Component, options: Options = {}): VueWrapper {
  // Remove cached constructor
  delete component._Ctor
  const vueClass = options.localVue || createLocalVue()
  const vm = createInstance(component, mergeOptions(options, config), vueClass)

  if (options.attachToDocument) {
    vm.$mount(createElement())
  } else {
    vm.$mount()
  }

  const componentsWithError = findAllVueComponentsFromVm(vm).filter(c => c._error)

  if (componentsWithError.length > 0) {
    throw (componentsWithError[0]._error)
  }

  return new VueWrapper(vm, { attachedToDocument: !!options.attachToDocument })
}
