import { addHook } from './add-hook'

export function addStubs (_Vue, stubComponents) {
  function addStubComponentsMixin () {
    Object.assign(this.$options.components, stubComponents)
  }

  addHook(_Vue.options, 'beforeMount', addStubComponentsMixin)
  // beforeCreate is for components created in node, which
  // never mount
  addHook(_Vue.options, 'beforeCreate', addStubComponentsMixin)
}
