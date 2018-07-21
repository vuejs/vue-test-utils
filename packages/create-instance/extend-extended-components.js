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
  Object.assign(components, options.components)
  let extendOptions = options.extendOptions
  while (extendOptions) {
    resolveComponents(extendOptions, components)
    extendOptions = extendOptions.extendOptions
  }
  return components
}

export function extendExtendedComponents (
  component,
  _Vue,
  logModifiedComponents,
  excludedComponents = { }
) {
  const extendedComponents = Object.create(null)
  const components = resolveComponents(component)
  Object.keys(components).forEach(c => {
    if (
      components[c].extendOptions &&
      !excludedComponents[c]
    ) {
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
      extendedComponents[c] = _Vue.extend(
        components[c]
      )
    }
    extendExtendedComponents(
      components[c],
      _Vue,
      logModifiedComponents
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
