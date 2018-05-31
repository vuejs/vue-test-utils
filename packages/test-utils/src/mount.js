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
import { addScopedSlots } from './add-scoped-slots'

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.config.errorHandler = errorHandler

export default function mount (component: Component, options: Options = {}): VueWrapper {
  warnIfNoWindow()

  const vueConstructor = options.localVue || createLocalVue()

  const elm = options.attachToDocument
    ? createElement()
    : undefined

  const mergedOptions = mergeOptions(options, config)

  const parentVm = createInstance(
    component,
    mergedOptions,
    vueConstructor,
    elm
  )

  const vm = parentVm.$mount(elm).$refs.vm

  // Workaround for Vue < 2.5
  vm._staticTrees = []

  if (options.scopedSlots) {
    addScopedSlots(vm, options.scopedSlots)

    if (mergedOptions.sync) {
      vm._watcher.sync = true
    }

    vm.$forceUpdate()
  }

  const componentsWithError = findAllVueComponentsFromVm(vm).filter(c => c._error)

  if (componentsWithError.length > 0) {
    throw (componentsWithError[0]._error)
  }

  const wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument,
    sync: mergedOptions.sync
  }

  return new VueWrapper(vm, wrapperOptions)
}
