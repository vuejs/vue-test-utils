import {
  createStubFromComponent
} from 'shared/create-component-stubs'
import { resolveComponent } from 'shared/util'
import { isReservedTag } from 'shared/validators'
import { addHook } from './add-hook'

const isWhitelisted = (el, whitelist) => resolveComponent(el, whitelist)
const isAlreadyStubbed = (el, stubs) => stubs.has(el)
const isDynamicComponent = cmp => typeof cmp === 'function' && !cmp.cid

function shouldExtend (component, _Vue) {
  return (typeof component === 'function' &&
  (component.options || component.functional) &&
  !(component instanceof _Vue)) ||
  (component && component.extends)
}

function createStub (shouldStub, component, _Vue, el) {
  if (shouldStub) {
    return createStubFromComponent(component || {}, el)
  }

  if (shouldExtend(component, _Vue)) {
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

function isConstructor (el) {
  return (typeof el === 'function')
}

export function patchRender (_Vue, stubs, stubAllComponents) {
  function patchRenderMixin () {
    const vm = this

    if (vm.$options.$_doNotStubChildren || vm._isFunctionalContainer) {
      return
    }

    const modifiedComponents = new Set()
    const originalCreateElement = vm.$createElement
    const originalComponents = vm.$options.components

    const createElement = (el, ...args) => {
      if (shouldNotBeStubbed(el, stubs, modifiedComponents)) {
        return originalCreateElement(el, ...args)
      }
      if (isConstructor(el)) {
        if (stubAllComponents) {
          const elem = createStubFromComponent(el, el.name || 'anonymous')
          return originalCreateElement(elem, ...args)
        }
        if (shouldExtend(el, _Vue)) {
          const extended = _Vue.extend(el)
          extended.options.$_vueTestUtils_original = el
          return originalCreateElement(extended, ...args)
        }
      }
      const element = resolveElement(
        el,
        vm.$options,
        modifiedComponents,
        originalComponents,
        stubAllComponents,
        _Vue
      )

      return originalCreateElement(element, ...args)
    }

    vm._c = createElement
    vm.$createElement = createElement
  }

  addHook(_Vue.options, 'beforeCreate', patchRenderMixin)
}
