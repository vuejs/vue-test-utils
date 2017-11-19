// @flow
import { throwError } from './util'

export function isDomSelector (selector: any): boolean {
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

export function isVueComponent (component: any): boolean {
  if (typeof component === 'function') {
    return false
  }

  if (component === null) {
    return false
  }

  if (typeof component !== 'object') {
    return false
  }

  return typeof component.render === 'function'
}

export function isValidSelector (selector: any): boolean {
  if (isDomSelector(selector)) {
    return true
  }

  if (isVueComponent(selector)) {
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
  const entries = Object.entries(refOptionsObject)

  if (!entries.length) {
    return false
  }

  const isValid = entries.every(([key, value]) => {
    return validFindKeys.includes(key) && typeof value === 'string'
  })

  return isValid
}
