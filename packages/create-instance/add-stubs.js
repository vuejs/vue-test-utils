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
  whitelist,
  shouldStub,
  _Vue
) {
  if (
    typeof el === 'string' && isReservedTag(el) ||
    shouldNotBeStubbed(el, whitelist) ||
    isAlreadyStubbed(el, componentStubs)
  ) {
    return el
  }

  if (typeof el === 'function' || typeof el === 'object' && shouldStub) {
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

  let stub

  if (shouldStub) {
    stub = createStubFromComponent(original || {}, el)
  } else if (
    (typeof original === 'function' &&
    (original.options || original.functional) &&
    !(original instanceof _Vue)) || (original && original.extends)
  ) {
    stub = _Vue.extend(original.options)
    stub.options.$_vueTestUtils_original = original
  }

  if (stub) {
    options.components = {
      ...options.components,
      [el]: stub
    }
    componentStubs.add(el)
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
      let element = el

      element = resolveElement(
        el,
        vm.$options,
        componentStubs,
        originalComponents,
        stubComponents,
        shouldProxy,
        _Vue
      )

      return originalCreateElement(element, ...args)
    }

    vm._c = createElement
    vm.$createElement = createElement
  }

  addHook(_Vue.options, 'beforeCreate', patchRender)

  addHook(_Vue.options, 'beforeMount', addStubComponentsMixin)
  // beforeCreate is for components created in node, which
  // never mount
  addHook(_Vue.options, 'beforeCreate', addStubComponentsMixin)
}
