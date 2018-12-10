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
import createLocalVue from './create-local-vue'
import { semVerGreaterThan, warn } from 'shared/util'
import { COMPAT_SYNC_MODE } from 'shared/consts'

Vue.config.productionTip = false
Vue.config.devtools = false

function getSyncOption (syncOption) {
  if (syncOption === false) {
    Vue.config.async = true
    return false
  }
  if (!semVerGreaterThan(Vue.version, '2.5.17')) {
    warn(
      `Vue Test Utils runs in sync mode by default. Due to bugs, sync mode ` +
      `requires Vue > 2.5.18. In Vue Test Utils 1.0 sync mode will only be ` +
      `supported with Vue 2.5.18 running in development mode. If you are ` +
      `unable to upgrade, you should rewrite your tests to run synchronously` +
      `you can do this by setting the sync mounting option to false.`
    )
    return COMPAT_SYNC_MODE
  }

  if (typeof Vue.config.async === 'undefined') {
    warn(
      `Sync mode only works when Vue runs in dev mode. ` +
      `Please set Vue to run in dev mode, or set sync to false`
    )
  }

  Vue.config.async = false
  return true
}

export default function mount (
  component: Component,
  options: Options = {}
): VueWrapper | Wrapper {
  const existingErrorHandler = Vue.config.errorHandler
  Vue.config.errorHandler = errorHandler

  warnIfNoWindow()

  const elm = options.attachToDocument ? createElement() : undefined

  const mergedOptions = mergeOptions(options, config)

  const parentVm = createInstance(
    component,
    mergedOptions,
    createLocalVue(options.localVue)
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
    sync: getSyncOption(mergedOptions.sync)
  }
  const root = vm.$options._isFunctionalContainer
    ? vm._vnode
    : vm

  component._Ctor = []

  return createWrapper(root, wrapperOptions)
}
