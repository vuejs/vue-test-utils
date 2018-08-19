// @flow

import './matches-polyfill'
import './object-assign-polyfill'
import Vue from 'vue'
import VueWrapper from './vue-wrapper'
import createInstance from 'create-instance'
import createElement from './create-element'
import errorHandler from './error-handler'
import { findAllVueComponentsFromVm } from './find-vue-components'
import { mergeOptions } from 'shared/merge-options'
import config from './config'
import warnIfNoWindow from './warn-if-no-window'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function mount (
  component: Component,
  options: Options = {}
): VueWrapper {
  const existingErrorHandler = Vue.config.errorHandler
  Vue.config.errorHandler = errorHandler

  warnIfNoWindow()

  // Remove cached constructor
  delete component._Ctor

  const elm = options.attachToDocument ? createElement() : undefined

  const mergedOptions = mergeOptions(options, config)

  const parentVm = createInstance(
    component,
    mergedOptions
  )

  const vm = parentVm.$mount(elm).$refs.vm

  const componentsWithError = findAllVueComponentsFromVm(vm).filter(
    c => c._error
  )

  if (componentsWithError.length > 0) {
    throw componentsWithError[0]._error
  }

  Vue.config.errorHandler = existingErrorHandler

  const wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument,
    sync: mergedOptions.sync
  }

  return new VueWrapper(vm, wrapperOptions)
}
