// @flow

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
import warnIfNoWindow from './warn-if-no-window'

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.config.errorHandler = errorHandler

export default function mount (component: Component, options: Options = {}): VueWrapper {
  warnIfNoWindow()
  // Remove cached constructor
  delete component._Ctor

  const vueConstructor = options.localVue || createLocalVue()

  const elm = options.attachToDocument
    ? createElement()
    : undefined

  const vm = createInstance(
    component,
    mergeOptions(options, config),
    vueConstructor,
    elm
  )

  const componentsWithError = findAllVueComponentsFromVm(vm).filter(c => c._error)

  if (componentsWithError.length > 0) {
    throw (componentsWithError[0]._error)
  }

  const wrapperOptions = {
    attachedToDocument: !!options.attachToDocument,
    sync: !!((options.sync || options.sync === undefined)),
    root: true
  }

  return new VueWrapper(vm, wrapperOptions)
}
