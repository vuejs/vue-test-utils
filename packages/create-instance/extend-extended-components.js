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

// Components created with Vue.extend are not created internally in Vue
// by extending a localVue constructor. To make sure they inherit
// properties add to a localVue constructor, we must create new components by
// extending the original extended components from the localVue constructor.
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
          `The child component <${c}> has been modified to ensure ` +
          `it is created with properties injected by Vue Test Utils. \n` +
          `This is because the component was created with Vue.extend, ` +
          `or uses the Vue Class Component decorator. \n` +
          `Because the component has been modified, it is not possible ` +
          `to find it with a component selector. To find the ` +
          `component, you must stub it manually using the stubs mounting ` +
          `option, or use a name or ref selector. \n` +
          `You can hide this warning by setting the Vue Test Utils ` +
          `config.logModifiedComponents option to false.`
        )
      }
      const extendedComp = _Vue.extend(comp)
      // used to identify instance when calling find with component selector
      if (extendedComp.extendOptions.options) {
        extendedComp.extendOptions.options.$_vueTestUtils_original = comp
      }
      extendedComp.extendOptions.$_vueTestUtils_original = comp
      extendedComponents[c] = extendedComp
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
