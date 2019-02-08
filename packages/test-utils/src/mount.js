import Vue from 'vue'
import createInstance from 'create-instance'
import createElement from './create-element'
import { throwIfInstancesThrew, addGlobalErrorHandler } from './error'
import { mergeOptions } from 'shared/merge-options'
import config from './config'
import warnIfNoWindow from './warn-if-no-window'
import createWrapper from './create-wrapper'
import createLocalVue from './create-local-vue'
import { validateOptions } from 'shared/validate-options'

Vue.config.productionTip = false
Vue.config.devtools = false

export default function mount(component, options = {}) {
  warnIfNoWindow()

  addGlobalErrorHandler(Vue)

  const _Vue = createLocalVue(options.localVue)

  const mergedOptions = mergeOptions(options, config)

  validateOptions(mergedOptions, component)

  const parentVm = createInstance(component, mergedOptions, _Vue)

  const el = options.attachToDocument ? createElement() : undefined
  const vm = parentVm.$mount(el)

  component._Ctor = {}

  throwIfInstancesThrew(vm)

  const wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument
  }

  const root = parentVm.$options._isFunctionalContainer
    ? vm._vnode
    : vm.$children[0]

  return createWrapper(root, wrapperOptions)
}
