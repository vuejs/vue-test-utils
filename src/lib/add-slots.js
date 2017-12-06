// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from './util'

function isValidSlot (slot: any): boolean {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function addSlotToVm (vm: Component, slotName: string, slotValue: Component | string | Array<Component> | Array<string>): void {
  let elem
  if (typeof slotValue === 'string') {
    if (!compileToFunctions) {
      throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
    }
    if (slotValue.trim()[0] === '<') {
      elem = vm.$createElement(compileToFunctions(slotValue))
    } else {
      if ('_v' in vm) {
        elem = vm._v(slotValue)
      } else {
        throwError('vue-test-utils support for passing text to slots at vue@2.2+')
      }
    }
  } else {
    elem = vm.$createElement(slotValue)
  }
  if (Array.isArray(vm.$slots[slotName])) {
    vm.$slots[slotName].push(elem)
  } else {
    vm.$slots[slotName] = [elem]
  }
}

function addSlots (vm: Component, slots: Object): void {
  Object.keys(slots).forEach((key) => {
    if (!isValidSlot(slots[key])) {
      throwError('slots[key] must be a Component, string or an array of Components')
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
