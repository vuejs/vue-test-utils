import {
  createStubsFromStubsObject,
  createStubFromComponent
} from 'shared/create-component-stubs'
import { resolveComponent } from 'shared/util'
import { isReservedTag } from 'shared/validators'
import { addHook } from './add-hook'

const shouldNotBeStubbed = (el, whitelist) => resolveComponent(el, whitelist)
const isAlreadyStubbed = (el, stubs) => stubs.has(el)

const isDynamicComponent = cmp => {
  return typeof cmp === 'function' &&
    !cmp.options &&
    !cmp.functional
}

function resolveElement (
  el,
  options,
  componentStubs,
  originalComponents,
  whitelist
) {
  if (
    isReservedTag(el) ||
    shouldNotBeStubbed(el, whitelist) ||
    isAlreadyStubbed(el, componentStubs)
  ) {
    return el
  }

  if (typeof el === 'function' || typeof el === 'object') {
    return createStubFromComponent(el, el.name || 'anonymous')
  }

  let original = resolveComponent(el, originalComponents)

  if (
    original &&
    original.options &&
    original.options.$_vueTestUtils_original
  ) {
    original = original.options.$_vueTestUtils_original
  }

  if (isDynamicComponent(original)) {
    return el
  }

  const stub = createStubFromComponent(original || {}, el)

  componentStubs.add(el)

  options.components = {
    ...options.components,
    [el]: stub
  }

  return el
}

export function addStubs (component, stubs, _Vue, shouldProxy) {
  const stubComponents = createStubsFromStubsObject(component.components, stubs)

  function addStubComponentsMixin () {
    Object.assign(this.$options.components, stubComponents)
  }

  function patchRender () {
    const vm = this
    if (vm.$options.doNotStubRender || vm._isFunctionalContainer) {
      return
    }

    const componentStubs = new Set()
    const originalCreateElement = vm.$createElement
    const originalComponents = vm.$options.components

    const createElement = (el, ...args) => {
      const element = resolveElement(
        el,
        vm.$options,
        componentStubs,
        originalComponents,
        stubComponents
      )

      return originalCreateElement(element, ...args)
    }

    vm._c = createElement
    vm.$createElement = createElement
  }

  if (shouldProxy) {
    addHook(_Vue.options, 'beforeCreate', patchRender)
  }

  addHook(_Vue.options, 'beforeMount', addStubComponentsMixin)
  // beforeCreate is for components created in node, which
  // never mount
  addHook(_Vue.options, 'beforeCreate', addStubComponentsMixin)
}
