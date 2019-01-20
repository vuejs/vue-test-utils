import { createStubFromComponent } from './create-component-stubs'
import { resolveComponent } from 'shared/util'
import {
  isReservedTag,
  isConstructor,
  isDynamicComponent,
  isComponentOptions
} from 'shared/validators'
import {
  BEFORE_RENDER_LIFECYCLE_HOOK,
  CREATE_ELEMENT_ALIAS
} from 'shared/consts'

const isWhitelisted = (el, whitelist) => resolveComponent(el, whitelist)
const isAlreadyStubbed = (el, stubs) => stubs.has(el)

function shouldExtend (component, _Vue) {
  return (
    isConstructor(component) ||
    (component && component.extends)
  )
}

function extend (component, _Vue) {
  const stub = _Vue.extend(component.options)
  stub.options.$_vueTestUtils_original = component
  stub.options._base = _Vue
  return stub
}

function createStubIfNeeded (shouldStub, component, _Vue, el) {
  if (shouldStub) {
    return createStubFromComponent(component || {}, el, _Vue)
  }

  if (shouldExtend(component, _Vue)) {
    return extend(component, _Vue)
  }
}

function shouldNotBeStubbed (el, whitelist, modifiedComponents) {
  return (
    (typeof el === 'string' && isReservedTag(el)) ||
    isWhitelisted(el, whitelist) ||
    isAlreadyStubbed(el, modifiedComponents)
  )
}

export function patchCreateElement (_Vue, stubs, stubAllComponents) {
  // This mixin patches vm.$createElement so that we can stub all components
  // before they are rendered in shallow mode. We also need to ensure that
  // component constructors were created from the _Vue constructor. If not,
  // we must replace them with components created from the _Vue constructor
  // before calling the original $createElement. This ensures that components
  // have the correct instance properties and stubs when they are rendered.
  function patchCreateElementMixin () {
    const vm = this

    if (
      vm.$options.$_doNotStubChildren ||
      vm.$options._isFunctionalContainer
    ) {
      return
    }

    const modifiedComponents = new Set()
    const originalCreateElement = vm.$createElement
    const originalComponents = vm.$options.components

    const createElement = (el, ...args) => {
      if (shouldNotBeStubbed(el, stubs, modifiedComponents)) {
        return originalCreateElement(el, ...args)
      }

      if (isConstructor(el) || isComponentOptions(el)) {
        if (stubAllComponents) {
          const stub = createStubFromComponent(el, el.name || 'anonymous', _Vue)
          return originalCreateElement(stub, ...args)
        }
        const Constructor = shouldExtend(el, _Vue) ? extend(el, _Vue) : el

        return originalCreateElement(Constructor, ...args)
      }

      if (typeof el === 'string') {
        let original = resolveComponent(el, originalComponents)

        if (!original) {
          return originalCreateElement(el, ...args)
        }

        if (
          original.options &&
          original.options.$_vueTestUtils_original
        ) {
          original = original.options.$_vueTestUtils_original
        }

        if (isDynamicComponent(original)) {
          return originalCreateElement(el, ...args)
        }

        const stub = createStubIfNeeded(stubAllComponents, original, _Vue, el)

        if (stub) {
          Object.assign(vm.$options.components, {
            [el]: stub
          })
          modifiedComponents.add(el)
        }
      }

      return originalCreateElement(el, ...args)
    }

    vm[CREATE_ELEMENT_ALIAS] = createElement
    vm.$createElement = createElement
  }

  _Vue.mixin({
    [BEFORE_RENDER_LIFECYCLE_HOOK]: patchCreateElementMixin
  })
}
