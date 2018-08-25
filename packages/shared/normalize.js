import { isPlainObject } from './validators'
import { throwError } from './util'

export function normalizeStubs (stubs = {}) {
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
