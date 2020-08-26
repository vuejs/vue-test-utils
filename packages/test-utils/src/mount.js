import Vue from 'vue'
import createInstance from 'create-instance'
import createElement from './create-element'
import { throwIfInstancesThrew, addGlobalErrorHandler } from './error'
import { mergeOptions } from 'shared/merge-options'
import config from './config'
import warnIfNoWindow from './warn-if-no-window'
import polyfill from './polyfill'
import createWrapper from './create-wrapper'
import _createLocalVue from 'shared/create-local-vue'
import { validateOptions } from 'shared/validate-options'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function mount(component, options = {}) {
  warnIfNoWindow()

  polyfill()

  addGlobalErrorHandler(Vue)

  const _Vue = _createLocalVue(options.localVue)

  const mergedOptions = mergeOptions(options, config)

  validateOptions(mergedOptions, component)

  const parentVm = createInstance(component, mergedOptions, _Vue)

  const el =
    options.attachTo || (options.attachToDocument ? createElement() : undefined)
  const vm = parentVm.$mount(el)

  component._Ctor = {}

  throwIfInstancesThrew(vm)

  const wrapperOptions = {
    attachedToDocument: !!el
  }

  const root = parentVm.$options._isFunctionalContainer
    ? vm._vnode
    : vm.$children[0]

  return createWrapper(root, wrapperOptions)
}
