// @flow

import Vue from 'vue'
import { addSlots } from './add-slots'
import { addScopedSlots } from './add-scoped-slots'
import addMocks from './add-mocks'
import addAttrs from './add-attrs'
import addListeners from './add-listeners'
import addProvide from './add-provide'
import { addEventLogger } from './log-events'
import { createComponentStubs } from 'shared/stub-components'
import { throwError } from 'shared/util'
import { compileTemplate } from './compile-template'
import deleteoptions from './delete-mounting-options'
import createFunctionalComponent from './create-functional-component'
import { componentNeedsCompiling } from 'shared/validators'

export default function createInstance (
  component: Component,
  options: Options,
  vue: Component
): Component {
  if (options.mocks) {
    addMocks(options.mocks, vue)
  }

  if ((component.options && component.options.functional) || component.functional) {
    component = createFunctionalComponent(component, options)
  } else if (options.context) {
    throwError(
      'mount.context can only be used when mounting a functional component'
    )
  }

  if (options.provide) {
    addProvide(component, options.provide, options)
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component)
  }

  addEventLogger(vue)

  const Constructor = vue.extend(component)

  const instanceOptions = { ...options }
  deleteoptions(instanceOptions)
  if (options.stubs) {
    instanceOptions.components = {
      ...instanceOptions.components,
      // $FlowIgnore
      ...createComponentStubs(component.components, options.stubs)
    }
  }

  const vm = new Constructor(instanceOptions)

  addAttrs(vm, options.attrs)
  addListeners(vm, options.listeners)

  if (options.scopedSlots) {
    if (window.navigator.userAgent.match(/PhantomJS/i)) {
      throwError('the scopedSlots option does not support in PhantomJS. Please use Puppeteer, or pass a component.')
    }
    const vueVersion = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)
    if (vueVersion >= 2.5) {
      vm.$_vueTestUtils_scopedSlots = {}
      vm.$_vueTestUtils_slotScopes = {}
      const renderSlot = vm._renderProxy._t

      vm._renderProxy._t = function (name, feedback, props, bindObject) {
        const scopedSlotFn = vm.$_vueTestUtils_scopedSlots[name]
        const slotScope = vm.$_vueTestUtils_slotScopes[name]
        if (scopedSlotFn) {
          props = { ...bindObject, ...props }
          const proxy = {}
          const helpers = ['_c', '_o', '_n', '_s', '_l', '_t', '_q', '_i', '_m', '_f', '_k', '_b', '_v', '_e', '_u', '_g']
          helpers.forEach((key) => {
            proxy[key] = vm._renderProxy[key]
          })
          proxy[slotScope] = props
          return scopedSlotFn.call(proxy)
        } else {
          return renderSlot.call(vm._renderProxy, name, feedback, props, bindObject)
        }
      }

      // $FlowIgnore
      addScopedSlots(vm, options.scopedSlots)
    } else {
      throwError('the scopedSlots option is only supported in vue@2.5+.')
    }
  }

  if (options.slots) {
    addSlots(vm, options.slots)
  }

  return vm
}
