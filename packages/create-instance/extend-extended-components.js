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

export function extendExtendedComponents (
  component,
  _Vue,
  logModifiedComponents,
  excludedComponents = { }
) {
  const componentOptions = typeof component === 'function'
    ? component.extendOptions
    : component
  const extendedComponents = Object.create(null)
  Object.keys(componentOptions.components || {}).forEach(c => {
    if (
      componentOptions.components[c].extendOptions &&
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
        componentOptions.components[c]
      )
    }
    extendExtendedComponents(
      componentOptions.components[c],
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
