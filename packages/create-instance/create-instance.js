// @flow

import { addSlots } from 'shared/add-slots'
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
import cloneDeep from 'lodash/cloneDeep'
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

  vm.$_mountingOptionsSlots = options.slots
  vm.$_originalSlots = cloneDeep(vm.$slots)

  if (options.slots) {
    addSlots(vm, options.slots)
  }

  return vm
}
