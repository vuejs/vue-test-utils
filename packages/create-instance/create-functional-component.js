// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from 'shared/util'
import { validateSlots } from './validate-slots'

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
        const component = typeof slot === 'string' ? compileToFunctions(slot) : slot
        const newSlot = h(component)
        newSlot.data.slot = slotType
        children.push(newSlot)
      })
    } else {
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
  if (mountingOptions.slots) {
    validateSlots(mountingOptions.slots)
  }

  return {
    render (h: Function) {
      return h(
        component,
        mountingOptions.context || component.FunctionalRenderContext,
        (mountingOptions.context && mountingOptions.context.children && mountingOptions.context.children.map(x => typeof x === 'function' ? x(h) : x)) || createFunctionalSlots(mountingOptions.slots, h)
      )
    },
    name: component.name,
    _isFunctionalContainer: true
  }
}
