// @flow

import { createSlotVNodes } from './add-slots'
import addMocks from './add-mocks'
import { addEventLogger } from './log-events'
import { createComponentStubs } from 'shared/stub-components'
import { throwError, warn, vueVersion } from 'shared/util'
import { compileTemplate } from 'shared/compile-template'
import extractInstanceOptions from './extract-instance-options'
import createFunctionalComponent from './create-functional-component'
import { componentNeedsCompiling, isPlainObject } from 'shared/validators'
import { validateSlots } from './validate-slots'
import createScopedSlots from './create-scoped-slots'

export default function createInstance (
  component: Component,
  options: Options,
  _Vue: Component,
  elm?: Element
): Component {
  // Remove cached constructor
  delete component._Ctor

  // mounting options are vue-test-utils specific
  //
  // instance options are options that are passed to the
  // root instance when it's instantiated
  //
  // component options are the root components options
  const componentOptions = typeof component === 'function'
    ? component.extendOptions
    : component

  const instanceOptions = extractInstanceOptions(options)

  if (options.mocks) {
    addMocks(options.mocks, _Vue)
  }
  if (
    (component.options && component.options.functional) ||
    component.functional
  ) {
    component = createFunctionalComponent(component, options)
  } else if (options.context) {
    throwError(
      `mount.context can only be used when mounting a ` + `functional component`
    )
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component)
  }

  addEventLogger(_Vue)

  const stubComponents = createComponentStubs(
    // $FlowIgnore
    component.components,
    // $FlowIgnore
    options.stubs
  )
  if (options.stubs) {
    instanceOptions.components = {
      ...instanceOptions.components,
      // $FlowIgnore
      ...stubComponents
    }
  }
  _Vue.mixin({
    created () {
      Object.assign(
        this.$options.components,
        stubComponents
      )
    }
  })
  Object.keys(componentOptions.components || {}).forEach(c => {
    if (
      componentOptions.components[c].extendOptions &&
      !instanceOptions.components[c]
    ) {
      if (options.logModifiedComponents) {
        warn(
          `an extended child component <${c}> has been modified ` +
          `to ensure it has the correct instance properties. ` +
          `This means it is not possible to find the component ` +
          `with a component selector. To find the component, ` +
          `you must stub it manually using the stubs mounting ` +
          `option.`
        )
      }
      instanceOptions.components[c] = _Vue.extend(
        componentOptions.components[c]
      )
    }
  })

  if (component.options) {
    component.options._base = _Vue
  }

  const Constructor = vueVersion < 2.3 && typeof component === 'function'
    ? component.extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions)

  Object.keys(instanceOptions.components || {}).forEach(key => {
    Constructor.component(key, instanceOptions.components[key])
    _Vue.component(key, instanceOptions.components[key])
  })

  if (options.slots) {
    validateSlots(options.slots)
  }

  // Objects are not resolved in extended components in Vue < 2.5
  // https://github.com/vuejs/vue/issues/6436
  if (
    options.provide &&
    typeof options.provide === 'object' &&
    vueVersion < 2.5
  ) {
    const obj = { ...options.provide }
    options.provide = () => obj
  }

  const scopedSlots = createScopedSlots(options.scopedSlots)

  if (options.parent && !isPlainObject(options.parent)) {
    throwError('options.parent should be a valid Vue component options object')
  }

  const parentComponentOptions = options.parent || {}
  parentComponentOptions.provide = options.provide
  parentComponentOptions.render = function (h) {
    const slots = options.slots
      ? createSlotVNodes(h, options.slots)
      : undefined
    return h(
      Constructor,
      {
        ref: 'vm',
        props: options.propsData,
        on: options.listeners,
        attrs: options.attrs,
        scopedSlots
      },
      slots
    )
  }
  const Parent = _Vue.extend(parentComponentOptions)

  return new Parent()
}
