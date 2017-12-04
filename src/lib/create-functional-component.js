// @flow

import cloneDeep from 'lodash/cloneDeep'
import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from './util'

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

export default function createFunctionalComponent (component: Component, mountingOptions: Options) {
  if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
    throwError('mount.context must be an object')
  }

  const clonedComponent = cloneDeep(component)
  return {
    render (h: Function) {
      return h(
        clonedComponent,
        mountingOptions.context || component.FunctionalRenderContext,
        (mountingOptions.context && mountingOptions.context.children && mountingOptions.context.children.map(x => typeof x === 'function' ? x(h) : x)) || createFunctionalSlots(mountingOptions.slots, h)
      )
    }
  }
}
