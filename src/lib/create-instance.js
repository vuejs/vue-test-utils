// @flow

import Vue from 'vue'
import addSlots from './add-slots'
import addMocks from './add-mocks'
import addAttrs from './add-attrs'
import addListeners from './add-listeners'
import addProvide from './add-provide'
import { stubComponents } from './stub-components'
import { throwError } from './util'
import cloneDeep from 'lodash/cloneDeep'
import { compileTemplate } from './compile-template'

export default function createConstructor (component: Component, options: Options): Component {
  const vue = options.localVue || Vue

  if (options.context) {
    if (!component.functional) {
      throwError('mount.context can only be used when mounting a functional component')
    }

    if (typeof options.context !== 'object') {
      throwError('mount.context must be an object')
    }
    const clonedComponent = cloneDeep(component)
    component = {
      render (h) {
        return h(clonedComponent, options.context)
      }
    }
  }

  if (options.provide) {
    addProvide(component, options)
  }

  if (options.stubs) {
    stubComponents(component, options.stubs)
  }

  if (!component.render && component.template && !component.functional) {
    compileTemplate(component)
  }

  const Constructor = vue.extend(component.extend ? component.options : component)

  if (options.mocks) {
    addMocks(options.mocks, Constructor)
  }

  const vm = new Constructor(options)

  addAttrs(vm, options.attrs)
  addListeners(vm, options.listeners)

  if (options.slots) {
    addSlots(vm, options.slots)
  }

  return vm
}
