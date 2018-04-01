// @flow
//
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

function extend (to: Object, _from: ?Object): Object {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
}

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
    const vueVersion = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)
    if (vueVersion >= 2.5) {
      vm.$_VueTestUtils_scopedSlots = {}
      const renderSlot = vm._renderProxy._t
      vm._renderProxy._t = function (name, feedback, props, bindObject) {
        const scopedSlotFn = vm.$_VueTestUtils_scopedSlots[name]
        if (scopedSlotFn) {
          props = extend(extend({}, bindObject), props)
          vm._renderProxy.props = props
          return scopedSlotFn.call(vm._renderProxy)
        } else {
          return renderSlot(name, feedback, props, bindObject)
        }
      }
      // $FlowIgnore
      addScopedSlots(vm, options.scopedSlots)
    } else {
      throwError('scopedSlots option supports vue@2.5+.')
    }
  }

  if (options.slots) {
    addSlots(vm, options.slots)
  }

  return vm
}
