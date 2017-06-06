// @flow

import { compileToFunctions } from 'vue-template-compiler'

function isValidSlot (slot: any): boolean {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function addSlotToVm (vm: Component, slotName: string, slotValue: Component | string | Array<Component> | Array<string>): void {
  if (Array.isArray(vm.$slots[slotName])) {
    if (typeof slotValue === 'string') {
      vm.$slots[slotName].push(vm.$createElement(compileToFunctions(slotValue)))
    } else {
      vm.$slots[slotName].push(vm.$createElement(slotValue))
    }
  } else {
    if (typeof slotValue === 'string') {
      vm.$slots[slotName] = [vm.$createElement(compileToFunctions(slotValue))]
    } else {
      vm.$slots[slotName] = [vm.$createElement(slotValue)] // eslint-disable-line no-param-reassign
    }
  }
}

function addSlots (vm: Component, slots: Object): void {
  Object.keys(slots).forEach((key) => {
    if (!isValidSlot(slots[key])) {
      throw new Error('slots[key] must be a Component, string or an array of Components')
    }

    if (Array.isArray(slots[key])) {
      slots[key].forEach((slotValue) => {
        addSlotToVm(vm, key, slotValue)
      })
    } else {
      addSlotToVm(vm, key, slots[key])
    }
  })
}

export default addSlots
