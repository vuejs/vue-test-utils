// @flow

import {
  DOM_SELECTOR,
  NAME_SELECTOR,
  COMPONENT_SELECTOR,
  FUNCTIONAL_OPTIONS
} from './consts'

export function vmMatchesName (vm: Component, name: string): boolean {
  return !!(
    name && (
      (vm &&
      vm.name === name) ||
    (vm.$options && vm.$options.name === name) ||
    (vm.options && vm.options.name === name)
    ))
}

function vmCtorMatches (vm, component) {
  // const componentOptions = typeof component === 'function'
  //   ? component.options
  //   : component
  const isFunctional = component.functional
  const Ctor = component._Ctor

  if (!Ctor) {
    return false
  }

  const constructor = vm.constructor
  return Object.keys(Ctor).some(c => {
    return isFunctional
      ? Ctor[c] === vm._Ctor[c]
      : Ctor[c] === constructor || Ctor[c] === constructor.super
  })
}

export function matches (node, selector) {
  if (selector.type === DOM_SELECTOR) {
    const element = node instanceof Element
      ? node
      : node.elm
    return element && element.matches && element.matches(selector.value)
  }

  const nameSelector =
  typeof selector.value === 'function'
    ? selector.value.extendOptions.name
    : selector.value.name
  const componentInstance = selector.value.functional
    ? node && node[FUNCTIONAL_OPTIONS]
    : node.componentInstance || node

  if (!componentInstance) {
    return false
  }

  if (selector.type === NAME_SELECTOR) {
    return vmMatchesName(componentInstance, nameSelector)
  }

  if (selector.type === COMPONENT_SELECTOR) {
    return vmCtorMatches(componentInstance, selector.value) ||
    vmMatchesName(componentInstance, nameSelector)
  }
}
