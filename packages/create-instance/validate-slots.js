// @flow

import { throwError } from 'shared/util'
import { compileToFunctions } from 'vue-template-compiler'

function isValidSlot (slot: any): boolean {
  return (
    Array.isArray(slot) ||
    (slot !== null && typeof slot === 'object') ||
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
    if (!isValidSlot(slots[key])) {
      throwError(
        `slots[key] must be a Component, string or an array ` + `of Components`
      )
    }

    requiresTemplateCompiler(slots[key])

    if (Array.isArray(slots[key])) {
      slots[key].forEach(slotValue => {
        if (!isValidSlot(slotValue)) {
          throwError(
            `slots[key] must be a Component, string or an array ` +
              `of Components`
          )
        }
        requiresTemplateCompiler(slotValue)
      })
    }
  })
}
