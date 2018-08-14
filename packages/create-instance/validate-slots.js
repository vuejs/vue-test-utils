// @flow

import { throwError } from 'shared/util'
import { compileToFunctions } from 'vue-template-compiler'
import { isVueComponent } from '../shared/validators'

function isValidSlot (slot: any): boolean {
  return (
    isVueComponent(slot) ||
    typeof slot === 'string'
  )
}

function requiresTemplateCompiler (slot: any): void {
  if (typeof slot === 'string' && !compileToFunctions) {
    throwError(
      `vueTemplateCompiler is undefined, you must pass ` +
      `precompiled components if vue-template-compiler is ` +
      `undefined`
    )
  }
}

export function validateSlots (slots: SlotsObject): void {
  Object.keys(slots).forEach(key => {
    const slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]]

    slot.forEach(slotValue => {
      if (!isValidSlot(slotValue)) {
        throwError(
          `slots[key] must be a Component, string or an array ` +
            `of Components`
        )
      }
      requiresTemplateCompiler(slotValue)
    })
  })
}
