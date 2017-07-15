// @flow

import Vue from 'vue'
import addSlots from './add-slots'
import addGlobals from './add-globals'
import addProvide from './add-provide'
import { stubComponents } from './stub-components'
import { throwError } from './util'
import { cloneDeep } from 'lodash'

export default function createConstructor (component: Component, options: Options): Component {
  const instance = options.instance || Vue

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

  if (options.stub) {
    stubComponents(component, options.stub)
  }

  const Constructor = instance.extend(component)

  if (options.intercept) {
    const globals = addGlobals(options.intercept)
    Constructor.use(globals)
  }

  const vm = new Constructor(options)

  if (options.slots) {
    addSlots(vm, options.slots)
  }

  return vm
}
