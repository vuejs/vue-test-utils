// @flow
import { throwError } from './util'

export function isDomSelector (selector: any) {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError('mount must be run in a browser environment like PhantomJS, jsdom or chrome')
    }
  } catch (error) {
    throwError('mount must be run in a browser environment like PhantomJS, jsdom or chrome')
  }

  try {
    document.querySelector(selector)
    return true
  } catch (error) {
    return false
  }
}

export function isVueComponent (component: any) {
  if (typeof component === 'function' && component.options) {
    return true
  }

  if (component === null || typeof component !== 'object') {
    return false
  }

  if (component.extends || component._Ctor) {
    return true
  }

  return typeof component.render === 'function'
}

export function componentNeedsCompiling (component: Component) {
  return component &&
    !component.render &&
    (component.template ||
      component.extends ||
      component.extendOptions) &&
    !component.functional
}

export function isRefSelector (refOptionsObject: any) {
  if (typeof refOptionsObject !== 'object' || Object.keys(refOptionsObject || {}).length !== 1) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

export function isNameSelector (nameOptionsObject: any) {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}
