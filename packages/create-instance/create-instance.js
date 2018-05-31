// @flow

import Vue from 'vue'
import { createSlotVNodes } from './add-slots'
import addMocks from './add-mocks'
import { addEventLogger } from './log-events'
import { createComponentStubs } from 'shared/stub-components'
import { throwError, warn } from 'shared/util'
import { compileTemplate } from 'shared/compile-template'
import deleteMountingOptions from './delete-mounting-options'
import createFunctionalComponent from './create-functional-component'
import { componentNeedsCompiling } from 'shared/validators'
import { validateSlots } from './validate-slots'

export default function createInstance (
  component: Component,
  options: Options,
  _Vue: Component,
  elm?: Element
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
    ...options,
    propsData: {
      ...options.propsData
    }
  }

  deleteMountingOptions(instanceOptions)

  // $FlowIgnore
  const stubComponents = createComponentStubs(component.components, options.stubs)
  if (options.stubs) {
    instanceOptions.components = {
      ...instanceOptions.components,
      // $FlowIgnore
      ...stubComponents
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

  Object.keys(stubComponents).forEach(c => {
    _Vue.component(c, stubComponents[c])
  })

  const Constructor = (typeof component === 'function' && component.prototype instanceof Vue)
    ? component.extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions)

  // const Constructor = _Vue.extend(component).extend(instanceOptions)

  Object.keys(instanceOptions.components || {}).forEach(key => {
    Constructor.component(key, instanceOptions.components[key])
    _Vue.component(key, instanceOptions.components[key])
  })

  if (options.slots) {
    validateSlots(options.slots)
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
