import { createStubsFromStubsObject } from 'shared/create-component-stubs'
import { addHook } from './add-hook'

export function addStubs (component, stubs, _Vue) {
  const stubComponents = createStubsFromStubsObject(
    component.components,
    stubs
  )

  function addStubComponentsMixin () {
    Object.assign(
      this.$options.components,
      stubComponents
    )
  }

  addHook(_Vue.options, 'beforeMount', addStubComponentsMixin)
  // beforeCreate is for components created in node, which
  // never mount
  addHook(_Vue.options, 'beforeCreate', addStubComponentsMixin)
}
