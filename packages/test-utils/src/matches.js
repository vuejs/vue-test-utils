import {
  DOM_SELECTOR,
  NAME_SELECTOR,
  COMPONENT_SELECTOR,
  FUNCTIONAL_OPTIONS
} from './consts'

export function vmMatchesName (vm, name) {
  return !!(
    (vm.name === name) ||
    (vm.$options && vm.$options.name === name)
  )
}

function vmCtorMatches (vm, component) {
  const Ctor = typeof component === 'function'
    ? component.options._Ctor
    : component._Ctor

  if (
    vm.$options && vm.$options.$_vueTestUtils_original === component ||
    vm.$_vueTestUtils_original === component
  ) {
    return true
  }

  if (!Ctor) {
    return false
  }

  const constructor = vm.constructor
  return Object.keys(Ctor).some(c => {
    return component.functional
      ? Ctor[c] === vm._Ctor[c]
      : Ctor[c] === constructor
  })
}

export function matches (node, selector) {
  if (selector.type === DOM_SELECTOR) {
    const element = node instanceof Element
      ? node
      : node.elm
    return element && element.matches && element.matches(selector.value)
  }

  const componentInstance = selector.value.functional
    ? node && node[FUNCTIONAL_OPTIONS]
    : node.child

  if (!componentInstance) {
    return false
  }

  if (selector.type === NAME_SELECTOR) {
    const nameSelector =
    typeof selector.value === 'function'
      ? selector.value.extendOptions.name
      : selector.value.name
    return vmMatchesName(componentInstance, nameSelector)
  }

  if (selector.type === COMPONENT_SELECTOR) {
    return vmCtorMatches(componentInstance, selector.value)
  }

  return false
}
