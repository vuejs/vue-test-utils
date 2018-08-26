import { createStubsFromStubsObject } from 'shared/create-component-stubs'

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

  _Vue.mixin({
    beforeMount: addStubComponentsMixin,
    // beforeCreate is for components created in node, which
    // never mount
    beforeCreate: addStubComponentsMixin
  })
}
