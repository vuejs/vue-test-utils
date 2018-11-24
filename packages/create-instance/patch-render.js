import {
  createStubFromComponent
} from 'shared/create-component-stubs'
import { resolveComponent, vueVersion } from 'shared/util'
import { isReservedTag } from 'shared/validators'
import { addHook } from './add-hook'

const isWhitelisted = (el, whitelist) => resolveComponent(el, whitelist)
const isAlreadyStubbed = (el, stubs) => stubs.has(el)
const isDynamicComponent = cmp => typeof cmp === 'function' && !cmp.cid

const CREATE_ELEMENT_ALIAS = vueVersion < 2.1 ? '_h' : '_c'
const LIFECYCLE_HOOK = vueVersion < 2.1 ? 'beforeMount' : 'beforeCreate'

function shouldExtend (component, _Vue) {
  return (typeof component === 'function' &&
  (component.options || component.functional) &&
  !(component instanceof _Vue)) ||
  (component && component.extends)
}

function extend (component, _Vue) {
  const stub = _Vue.extend(component.options)
  stub.options.$_vueTestUtils_original = component
  return stub
}

function createStubIfNeeded (shouldStub, component, _Vue, el) {
  if (shouldStub) {
    return createStubFromComponent(component || {}, el)
  }

  if (shouldExtend(component, _Vue)) {
    return extend(component, _Vue)
  }
}

function shouldNotBeStubbed (el, whitelist, modifiedComponents) {
  return (
    typeof el === 'string' && isReservedTag(el) ||
    isWhitelisted(el, whitelist) ||
    isAlreadyStubbed(el, modifiedComponents)
  )
}

function isConstructor (el) {
  return (typeof el === 'function')
}

export function patchRender (_Vue, stubs, stubAllComponents) {
  // This mixin patches vm.$createElement so that we can stub all components
  // before they are rendered in shallow mode. We also need to ensure that
  // component constructors were created from the _Vue constructor. If not,
  // we must replace them with components created from the _Vue constructor
  // before calling the original $createElement. This ensures that components
  // have the correct instance properties and stubs when they are rendered.
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
          const stub = createStubFromComponent(
            el,
            el.name || 'anonymous'
          )
          return originalCreateElement(stub, ...args)
        }

        const Constructor = shouldExtend(el, _Vue)
          ? extend(el, _Vue)
          : el

        return originalCreateElement(Constructor, ...args)
      }

      if (typeof el === 'string') {
        let original = resolveComponent(el, originalComponents)

        if (
          original &&
          original.options &&
          original.options.$_vueTestUtils_original
        ) {
          original = original.options.$_vueTestUtils_original
        }

        if (isDynamicComponent(original)) {
          return originalCreateElement(el, ...args)
        }

        const stub = createStubIfNeeded(
          stubAllComponents,
          original,
          _Vue,
          el
        )

        if (stub) {
          vm.$options.components = {
            ...vm.$options.components,
            [el]: stub
          }
          modifiedComponents.add(el)
        }
      }

      return originalCreateElement(el, ...args)
    }

    vm[CREATE_ELEMENT_ALIAS] = createElement
    vm.$createElement = createElement
  }

  addHook(_Vue.options, LIFECYCLE_HOOK, patchRenderMixin)
}
