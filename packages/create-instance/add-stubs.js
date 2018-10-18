import {
  createStubsFromStubsObject,
  createStubFromComponent
} from 'shared/create-component-stubs'
import { addHook } from './add-hook'

export function addStubs (component, stubs, _Vue, shouldProxy) {
  const stubComponents = createStubsFromStubsObject(
    component.components,
    stubs
  )

  function addStubComponentsMixin () {
    Object.assign(
      this.$options.components,
      stubComponents
    )
    if (typeof Proxy !== 'undefined' && shouldProxy) {
      this.$options.components = new Proxy(this.$options.components, {
        set (target, prop, value) {
          if (!target[prop]) {
            target[prop] = createStubFromComponent(value, prop)
          }
          return true
        }
      })
    }
  }

  addHook(_Vue.options, 'beforeMount', addStubComponentsMixin)
  // beforeCreate is for components created in node, which
  // never mount
  addHook(_Vue.options, 'beforeCreate', addStubComponentsMixin)
}
