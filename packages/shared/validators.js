// @flow
// import concat from 'lodash/concat'
import {
  camelize,
  capitalize,
  htmlTags,
  hyphenate,
  svgElements,
  throwError
} from './util'

export function isDomSelector (selector: any): boolean {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError(
        `mount must be run in a browser environment like ` +
          `PhantomJS, jsdom or chrome`
      )
    }
  } catch (error) {
    throwError(
      `mount must be run in a browser environment like ` +
        `PhantomJS, jsdom or chrome`
    )
  }

  try {
    document.querySelector(selector)
    return true
  } catch (error) {
    return false
  }
}

export function isVueComponent (component: any): boolean {
  if (typeof component === 'function' && component.options) {
    return true
  }

  if (component === null || typeof component !== 'object') {
    return false
  }

  if (component.extends || component._Ctor) {
    return true
  }

  if (typeof component.template === 'string') {
    return true
  }

  return typeof component.render === 'function'
}

export function componentNeedsCompiling (component: Component): boolean {
  return (
    component &&
    !component.render &&
    (component.template || component.extends || component.extendOptions) &&
    !component.functional
  )
}

export function isRefSelector (refOptionsObject: any): boolean {
  if (
    typeof refOptionsObject !== 'object' ||
    Object.keys(refOptionsObject || {}).length !== 1
  ) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

export function isNameSelector (nameOptionsObject: any): boolean {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}

export function isTagSelector (selector: any) {
  if (typeof selector !== 'string') {
    return false
  }
  const pseudoSelectors = ['.', '#', '[', ':', '>', ' ']

  if (htmlTags.includes(selector) ||
    svgElements.includes(selector) ||
    selector.split('').some(char => pseudoSelectors.includes(char))) {
    /* TODO: Throw error for cases such as find("a > my-component")
    const tags = selector.split(/\.|\[|\s|>|#|:/).filter(tag => tag.length > 0)
    const componentTags =
      tags.filter(tag => {
        return !concat(htmlTags, pseudoSelectors, svgElements).includes(tag)
      })

        componentTags.forEach(tag => {
          const selectorWithoutWhitespace = selector.replace(/\s/g, '')
          const tagIndex = selectorWithoutWhitespace.indexOf(tag)
          if (
            pseudoSelectors.includes(
              selectorWithoutWhitespace[tagIndex + tag.length]) ||
            (tagIndex !== 0 &&
            pseudoSelectors.includes(
              selectorWithoutWhitespace[tagIndex - 1]))
          ) {
            throwError(
              'Pseudo selectors cannot be used with component tag selectors')
          }
        })
    */
    return false
  } else {
    return true
  }
}

export function templateContainsComponent (
  template: string,
  name: string
): boolean {
  return [capitalize, camelize, hyphenate].some(format => {
    const re = new RegExp(`<${format(name)}\\s*(\\s|>|(\/>))`, 'g')
    return re.test(template)
  })
}

export function isPlainObject (obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export function isRequiredComponent (name: string): boolean {
  return (
    name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
  )
}
