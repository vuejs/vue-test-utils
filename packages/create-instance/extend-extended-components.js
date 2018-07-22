import { warn } from 'shared/util'

function createdFrom (extendOptions, componentOptions) {
  while (extendOptions) {
    if (extendOptions === componentOptions) {
      return true
    }
    if (extendOptions._vueTestUtilsRoot === componentOptions) {
      return true
    }
    extendOptions = extendOptions.extendOptions
  }
}

function resolveComponents (options = {}, components = {}) {
  let extendOptions = options.extendOptions
  while (extendOptions) {
    resolveComponents(extendOptions, components)
    extendOptions = extendOptions.extendOptions
  }
  let extendsFrom = options.extends
  while (extendsFrom) {
    resolveComponents(extendsFrom, components)
    extendsFrom = extendsFrom.extends
  }
  Object.keys(options.components || {}).forEach((c) => {
    components[c] = options.components[c]
  })
  return components
}

function shouldExtend (component) {
  while (component) {
    if (component.extendOptions) {
      return true
    }
    component = component.extends
  }
}

// Components created with Vue.extend will not inherit from
// a localVue constructor by default. To make sure they inherit
// from a localVue constructor, we must create new components by
// extending the original extended components from the localVue constructor.
// The registered original extended components should only be
// overwritten in the component that they are registered on.
// We apply a global mixin that overwrites the components original
// components with the extended components when they are created.
export function extendExtendedComponents (
  component,
  _Vue,
  logModifiedComponents,
  excludedComponents = { },
  stubAllComponents = false
) {
  const extendedComponents = Object.create(null)
  const components = resolveComponents(component)

  Object.keys(components).forEach(c => {
    const comp = components[c]
    const shouldExtendComponent =
      (shouldExtend(comp) &&
      !excludedComponents[c]) ||
      stubAllComponents
    if (shouldExtendComponent) {
      if (logModifiedComponents) {
        warn(
          `an extended child component <${c}> has been modified ` +
          `to ensure it has the correct instance properties. ` +
          `This means it is not possible to find the component ` +
          `with a component selector. To find the component, ` +
          `you must stub it manually using the stubs mounting ` +
          `option.`
        )
      }
      extendedComponents[c] = _Vue.extend(comp)
    }
    // If a component has been replaced with an extended component
    // all its child components must also be replaced.
    extendExtendedComponents(
      comp,
      _Vue,
      logModifiedComponents,
      {},
      shouldExtendComponent
    )
  })
  if (extendedComponents) {
    _Vue.mixin({
      created () {
        if (createdFrom(this.constructor, component)) {
          Object.assign(
            this.$options.components,
            extendedComponents
          )
        }
      }
    })
  }
}
