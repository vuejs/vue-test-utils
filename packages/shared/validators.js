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

  if (component === null) {
    return false
  }

  if (typeof component !== 'object') {
    return false
  }

  if (component.extends) {
    return true
  }

  if (component._Ctor) {
    return true
  }

  return typeof component.render === 'function'
}

export function componentNeedsCompiling (component: Component) {
  return component &&
    !component.render &&
    (component.template || component.extends) &&
    !component.functional
}

export function isValidSelector (selector: any) {
  if (isDomSelector(selector)) {
    return true
  }

  if (isVueComponent(selector)) {
    return true
  }

  if (isNameSelector(selector)) {
    return true
  }

  return isRefSelector(selector)
}

export function isRefSelector (refOptionsObject: any) {
  if (typeof refOptionsObject !== 'object') {
    return false
  }

  if (refOptionsObject === null) {
    return false
  }

  const validFindKeys = ['ref']
  const keys = Object.keys(refOptionsObject)
  if (!keys.length) {
    return false
  }

  const isValid = Object.keys(refOptionsObject).every((key) => {
    return validFindKeys.includes(key) &&
      typeof refOptionsObject[key] === 'string'
  })

  return isValid
}

export function isNameSelector (nameOptionsObject: any) {
  if (typeof nameOptionsObject !== 'object') {
    return false
  }

  if (nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}
