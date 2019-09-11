import { isPlainObject } from './validators'
import { throwError } from './util'
import { VUE_VERSION } from './consts'

export function normalizeStubs(stubs = {}) {
  if (stubs === false) {
    return false
  }
  if (isPlainObject(stubs)) {
    return stubs
  }
  if (Array.isArray(stubs)) {
    return stubs.reduce((acc, stub) => {
      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string')
      }
      acc[stub] = true
      return acc
    }, {})
  }
  throwError('options.stubs must be an object or an Array')
}

export function normalizeProvide(provide) {
  // Objects are not resolved in extended components in Vue < 2.5
  // https://github.com/vuejs/vue/issues/6436
  if (typeof provide === 'object' && VUE_VERSION < 2.5) {
    const obj = { ...provide }
    return () => obj
  }
  return provide
}
