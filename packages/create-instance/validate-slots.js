// @flow

import { throwError, toArray, isObject } from 'shared/util'
import { compileToFunctions } from 'vue-template-compiler'

export function validateSlots (slots: Object): void {
  Object.keys(slots).forEach(key => {
    toArray(slots[key]).forEach(slotValue => {
      if (!isObject(slotValue) && typeof slotValue !== 'string') {
        throwError('slots[key] must be a Component, string or an array of Components')
      }

      if (typeof slotValue === 'string') {
        if (!compileToFunctions) {
          throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
        }
        if (typeof window === 'undefined') {
          throwError('the slots string option does not support strings in server-test-uitls.')
        }
        if (window.navigator.userAgent.match(/PhantomJS/i)) {
          throwError('the slots option does not support strings in PhantomJS. Please use Puppeteer, or pass a component.')
        }
      }
    })
  })
}
