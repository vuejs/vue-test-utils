// @flow

import {
  isDomSelector,
  isNameSelector,
  isRefSelector,
  isVueComponent
} from 'shared/validators'
import {
  throwError
} from 'shared/util'
import {
  REF_SELECTOR,
  COMPONENT_SELECTOR,
  NAME_SELECTOR,
  DOM_SELECTOR
} from './consts'

function getSelectorType (selector: Selector): string | void {
  if (isDomSelector(selector)) {
    return DOM_SELECTOR
  }

  if (isNameSelector(selector)) {
    return NAME_SELECTOR
  }

  if (isVueComponent(selector)) {
    return COMPONENT_SELECTOR
  }

  if (isRefSelector(selector)) {
    return REF_SELECTOR
  }
}

export default function getSelectorTypeOrThrow (selector: Selector, methodName: string): string | void {
  const selectorType = getSelectorType(selector)
  if (!selectorType) {
    throwError(`wrapper.${methodName}() must be passed a valid CSS selector, Vue constructor, or valid find option object`)
  }
  return selectorType
}
