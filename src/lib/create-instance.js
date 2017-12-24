// @flow

import addSlots from './add-slots'
import addMocks from './add-mocks'
import addAttrs from './add-attrs'
import addListeners from './add-listeners'
import addProvide from './add-provide'
import { addEventLogger } from './log-events'
import { createComponentStubs } from './stub-components'
import { throwError } from './util'
import { compileTemplate } from './compile-template'
import createLocalVue from '../create-local-vue'
import extractOptions from '../options/extract-options'
import deleteMountingOptions from '../options/delete-mounting-options'
import createFunctionalComponent from './create-functional-component'
import cloneDeep from 'lodash/cloneDeep'

export default function createConstructor (
  component: Component,
  options: Options
): Component {
  const mountingOptions = extractOptions(options)

  const vue = mountingOptions.localVue || createLocalVue()

  if (mountingOptions.mocks) {
    addMocks(mountingOptions.mocks, vue)
  }

  if (component.functional) {
    component = createFunctionalComponent(component, mountingOptions)
  } else if (mountingOptions.context) {
    throwError(
      'mount.context can only be used when mounting a functional component'
    )
  }

  if (mountingOptions.provide) {
    addProvide(component, mountingOptions.provide, options)
  }

  if (!component.render &&
    (component.template || component.extends) &&
    !component.functional) {
    compileTemplate(component)
  }

  addEventLogger(vue)

  const Constructor = vue.extend(component)

  const instanceOptions = { ...options }
  deleteMountingOptions(instanceOptions)

  if (mountingOptions.stubs) {
    instanceOptions.components = {
      ...instanceOptions.components,
      // $FlowIgnore
      ...createComponentStubs(component.components, mountingOptions.stubs)
    }
  }

  const vm = new Constructor(instanceOptions)

  addAttrs(vm, mountingOptions.attrs)
  addListeners(vm, mountingOptions.listeners)

  vm.$_mountingOptionsSlots = mountingOptions.slots
  vm.$_originalSlots = cloneDeep(vm.$slots)

  if (mountingOptions.slots) {
    addSlots(vm, mountingOptions.slots)
  }

  return vm
}
