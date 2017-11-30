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
import { compileToFunctions } from 'vue-template-compiler'

function isValidSlot (slot: any): boolean {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function createFunctionalSlots (slots = {}, h) {
  if (Array.isArray(slots.default)) {
    return slots.default.map(h)
  }

  if (typeof slots.default === 'string') {
    return [h(compileToFunctions(slots.default))]
  }
  const children = []
  Object.keys(slots).forEach(slotType => {
    if (Array.isArray(slots[slotType])) {
      slots[slotType].forEach(slot => {
        if (!isValidSlot(slot)) {
          throwError('slots[key] must be a Component, string or an array of Components')
        }
        const component = typeof slot === 'string' ? compileToFunctions(slot) : slot
        const newSlot = h(component)
        newSlot.data.slot = slotType
        children.push(newSlot)
      })
    } else {
      if (!isValidSlot(slots[slotType])) {
        throwError('slots[key] must be a Component, string or an array of Components')
      }
      const component = typeof slots[slotType] === 'string' ? compileToFunctions(slots[slotType]) : slots[slotType]
      const slot = h(component)
      slot.data.slot = slotType
      children.push(slot)
    }
  })
  return children
}

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
          mountingOptions.context || component.FunctionalRenderContext,
          (mountingOptions.context && mountingOptions.context.children && mountingOptions.context.children.map(x => typeof x === 'function' ? x(h) : x)) || createFunctionalSlots(mountingOptions.slots, h)
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
