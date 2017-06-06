// @flow

export function isDomSelector (selector: any): boolean {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throw new Error('mount must be run in a browser environment like PhantomJS, jsdom or chrome')
    }
  } catch (error) {
    throw new Error('mount must be run in a browser environment like PhantomJS, jsdom or chrome')
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

  return isVueComponent(selector)
}
