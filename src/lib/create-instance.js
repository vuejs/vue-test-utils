// @flow

import addSlots from './add-slots'
import addMocks from './add-mocks'
import addAttrs from './add-attrs'
import addListeners from './add-listeners'
import addProvide from './add-provide'
import { stubComponents } from './stub-components'
import { throwError } from './util'
import { compileTemplate } from './compile-template'
import createLocalVue from '../create-local-vue'
import extractOptions from '../options/extract-options'
import deleteMountingOptions from '../options/delete-mounting-options'
import createFunctionalComponent from './create-functional-component'

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

  if (mountingOptions.stubs) {
    stubComponents(component, mountingOptions.stubs)
  }

  if (!component.render && component.template && !component.functional) {
    compileTemplate(component)
  }

  const Constructor = vue.extend(component)

  const instanceOptions = { ...options }
  deleteMountingOptions(instanceOptions)

  const vm = new Constructor(instanceOptions)

  addAttrs(vm, mountingOptions.attrs)
  addListeners(vm, mountingOptions.listeners)

  if (mountingOptions.slots) {
    addSlots(vm, mountingOptions.slots)
  }

  return vm
}
