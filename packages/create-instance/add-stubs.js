import { createComponentStubs } from 'shared/stub-components'

export function addStubs (component, stubs, _Vue) {
  // if the component has a name, add a stub
  const stubComponents = createComponentStubs(
    component.components,
    // $FlowIgnore
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
