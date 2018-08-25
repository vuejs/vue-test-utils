// @flow

import './matches-polyfill'
import './object-assign-polyfill'
import Vue from 'vue'
import VueWrapper from './vue-wrapper'
import createInstance from 'create-instance'
import createElement from './create-element'
import errorHandler from './error-handler'
import { findAllInstances } from './find'
import { mergeOptions } from 'shared/merge-options'
import config from './config'
import warnIfNoWindow from './warn-if-no-window'
import createWrapper from './create-wrapper'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function mount (
  component: Component,
  options: Options = {}
): VueWrapper | Wrapper {
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

  const componentsWithError = findAllInstances(vm).filter(
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
  const root = vm.$options._isFunctionalContainer
    ? vm._vnode
    : vm
  return createWrapper(root, wrapperOptions)
}
