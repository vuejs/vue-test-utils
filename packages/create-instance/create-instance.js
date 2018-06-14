// @flow

import { createSlotVNodes } from './add-slots'
import addMocks from './add-mocks'
import { addEventLogger } from './log-events'
import { createComponentStubs } from 'shared/stub-components'
import { throwError, warn, vueVersion } from 'shared/util'
import { compileTemplate } from 'shared/compile-template'
import deleteMountingOptions from './delete-mounting-options'
import createFunctionalComponent from './create-functional-component'
import { componentNeedsCompiling } from 'shared/validators'
import { validateSlots } from './validate-slots'

export default function createInstance (
  component: Component,
  options: Options,
  _Vue: Component
): Component {
  // Remove cached constructor
  delete component._Ctor
  if (options.mocks) {
    addMocks(options.mocks, _Vue)
  }
  if ((component.options && component.options.functional) || component.functional) {
    component = createFunctionalComponent(component, options)
  } else if (options.context) {
    throwError(
      'mount.context can only be used when mounting a functional component'
    )
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component)
  }

  addEventLogger(_Vue)

  const instanceOptions = {
    ...options
  }

  deleteMountingOptions(instanceOptions)

  // $FlowIgnore
  if (options.stubs) {
    instanceOptions.components = {
      ...instanceOptions.components,
        // $FlowIgnore
      ...createComponentStubs(component.components, options.stubs)
    }
  }

  Object.keys(component.components || {}).forEach((c) => {
    if (component.components[c].extendOptions &&
      !instanceOptions.components[c]) {
      if (options.logModifiedComponents) {
        warn(`an extended child component ${c} has been modified to ensure it has the correct instance properties. This means it is not possible to find the component with a component selector. To find the component, you must stub it manually using the stubs mounting option.`)
      }
      instanceOptions.components[c] = _Vue.extend(component.components[c])
    }
  })

  const Constructor = vueVersion < 2.3 && typeof component === 'function'
    ? component.extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions)

  if (options.slots) {
    validateSlots(options.slots)
  }

  _Vue.mixin({
    beforeCreate () {
      this.$options.components = {
        ...this.$options.components,
        ...instanceOptions.components
      }
    }
  })

  // Objects are not resolved in extended components in Vue < 2.5
  // https://github.com/vuejs/vue/issues/6436
  if (options.provide &&
    typeof options.provide === 'object' &&
    vueVersion < 2.5
  ) {
    const obj = { ...options.provide }
    options.provide = () => obj
  }

  const Parent = _Vue.extend({
    provide: options.provide,
    render (h) {
      const slots = options.slots
        ? createSlotVNodes(h, options.slots)
        : undefined
      return h(Constructor, {
        ref: 'vm',
        props: options.propsData,
        on: options.listeners,
        attrs: options.attrs
      }, slots)
    }
  })

  return new Parent()
}
