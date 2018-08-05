// @flow

import {
  DOM_SELECTOR,
  NAME_SELECTOR,
  COMPONENT_SELECTOR,
  FUNCTIONAL_OPTIONS
} from './consts'
import { vmCtorMatchesSelector } from './find-vue-components';

export function vmMatchesName (vm: Component, name: string): boolean {
  return !!(
    name && (
      (vm._vnode &&
      vm._vnode.functionalOptions &&
      vm._vnode.functionalOptions.name === name) ||
    (vm.$options && vm.$options.name === name) ||
    (vm.options && vm.options.name === name)
    ))
}

function vmCtorMatches(vm, component) {
  const componentOptions = typeof component === 'function'
  ? component.options
  : component
  const isFunctional = componentOptions.functional
  const Ctor = componentOptions._Ctor

  if (!Ctor) {
    return false
  }
  debugger
  const constructor = vm.constructor
  return Object.keys(Ctor).some(c => {
    return isFunctional
    ? Ctor[c] === vm._Ctor[c]
    : Ctor[c] === constructor || Ctor[c] === constructor.super
  })
}

export function matches(node, selectorType, selector) {
  debugger
  if(selectorType === DOM_SELECTOR) {
    const element = node instanceof Element
    ? node
    : node.elm
    return element && element.matches(selector)
  }

  const nameSelector =
  typeof selector === 'function' ? selector.extendOptions.name : selector.name

  if(selectorType === NAME_SELECTOR) {
    const componentInstance = node && node.parent && node.parent.componentInstance
    if(!componentInstance) {
      return false
    }
    return vmMatchesName(componentInstance, nameSelector)
  }

  if(selectorType === COMPONENT_SELECTOR) {
    debugger
    const componentInstance = selector.functional
    ? node && node[FUNCTIONAL_OPTIONS]
    : node && node.parent && node.parent.componentInstance
    return vmCtorMatches(componentInstance, selector) ||
    vmMatchesName(componentInstance, nameSelector)
  }
}
