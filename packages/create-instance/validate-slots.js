// @flow

import { throwError } from 'shared/util'
import {
  checkCompileToFunctions,
  isVueComponent
} from 'shared/validators'

function isValidSlot (slot: any): boolean {
  return (
    isVueComponent(slot) ||
    typeof slot === 'string'
  )
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
      if (typeof slotValue === 'string') {
        checkCompileToFunctions()
      }
    })
  })
}
