// @flow

import addSlots from './add-slots'
import addMocks from './add-mocks'
import addAttrs from './add-attrs'
import addListeners from './add-listeners'
import addProvide from './add-provide'
import { stubComponents } from './stub-components'
import { throwError } from './util'
import cloneDeep from 'lodash/cloneDeep'
import { compileTemplate } from './compile-template'
import createLocalVue from '../create-local-vue'
import extractOptions from '../options/extract-options'
import deleteMountingOptions from '../options/delete-mounting-options'

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
    if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
      throwError('mount.context must be an object')
    }
    const clonedComponent = cloneDeep(component)
    component = {
      render (h) {
        return h(
          clonedComponent,
          mountingOptions.context || component.FunctionalRenderContext
        )
      }
    }
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
