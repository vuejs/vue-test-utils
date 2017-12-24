// @flow

import {
  isDomSelector,
  isNameSelector,
  isRefSelector,
  isVueComponent
} from './validators.js'
import { throwError } from '../lib/util'

export const selectorTypes = {
  DOM_SELECTOR: 'DOM_SELECTOR',
  NAME_SELECTOR: 'NAME_SELECTOR',
  REF_SELECTOR: 'REF_SELECTOR',
  VUE_COMPONENT: 'VUE_COMPONENT'
}

function getSelectorType (selector: Selector): string | void {
  if (isDomSelector(selector)) {
    return selectorTypes.DOM_SELECTOR
  }

  if (isNameSelector(selector)) {
    return selectorTypes.NAME_SELECTOR
  }

  if (isVueComponent(selector)) {
    return selectorTypes.VUE_COMPONENT
  }

  if (isRefSelector(selector)) {
    return selectorTypes.REF_SELECTOR
  }
}

export default function getSelectorTypeOrThrow (selector: Selector, methodName: string): string | void {
  const selectorType = getSelectorType(selector)
  if (!selectorType) {
    throwError(`wrapper.${methodName}() must be passed a valid CSS selector, Vue constructor, or valid find option object`)
  }
  return selectorType
}
