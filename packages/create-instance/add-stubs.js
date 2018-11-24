import {
  createStubsFromStubsObject,
  createStubFromComponent
} from 'shared/create-component-stubs'
import { resolveComponent } from 'shared/util'
import { isReservedTag } from 'shared/validators'
import { addHook } from './add-hook'

const isWhitelisted = (el, whitelist) => resolveComponent(el, whitelist)
const isAlreadyStubbed = (el, stubs) => stubs.has(el)

const isDynamicComponent = cmp => {
  return typeof cmp === 'function' &&
    !cmp.options &&
    !cmp.functional
}

function createStub (shouldStub, component, _Vue, el) {
  if (shouldStub) {
    return createStubFromComponent(component || {}, el)
  }

  if (
    (typeof component === 'function' &&
    (component.options || component.functional) &&
    !(component instanceof _Vue)) ||
    (component && component.extends)
  ) {
    const stub = _Vue.extend(component.options)
    stub.options.$_vueTestUtils_original = component
    return stub
  }
}

function resolveElement (
  el,
  options,
  componentStubs,
  originalComponents,
  shouldStub,
  _Vue
) {
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

  const stub = createStub(shouldStub, original, _Vue, el)

  if (stub) {
    options.components = {
      ...options.components,
      [el]: stub
    }
    componentStubs.add(el)
  }

  return el
}

function shouldNotBeStubbed (el, whitelist, existingStubs) {
  return (
    typeof el === 'string' && isReservedTag(el) ||
    isWhitelisted(el, whitelist) ||
    isAlreadyStubbed(el, existingStubs)
  )
}

// function isConstructor (el) {
//   (typeof el === 'function' ||
//   typeof el === 'object')
// }

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
      if (shouldNotBeStubbed(el, stubComponents, componentStubs)) {
        return originalCreateElement(el, ...args)
      }
      // isConstructor(el) && shouldProxy
      // ? createStubFromComponent(el, el.name || 'anonymous')
      // :
      const element = resolveElement(
        el,
        vm.$options,
        componentStubs,
        originalComponents,
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
