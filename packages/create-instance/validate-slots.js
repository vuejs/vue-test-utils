// @flow

import { throwError } from 'shared/util'

function isValidSlot (slot: any): boolean {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

export function validateSlots (slots: Object): void {
  slots && Object.keys(slots).forEach((key) => {
    if (!isValidSlot(slots[key])) {
      throwError('slots[key] must be a Component, string or an array of Components')
    }

    if (Array.isArray(slots[key])) {
      slots[key].forEach((slotValue) => {
        if (!isValidSlot(slotValue)) {
          throwError('slots[key] must be a Component, string or an array of Components')
        }
      })
    }
  })
}
