// @flow

import { createSlotVNodes } from './create-slot-vnodes'
import addMocks from './add-mocks'
import { addEventLogger } from './log-events'
import { createComponentStubs } from 'shared/stub-components'
import { throwError, vueVersion } from 'shared/util'
import { compileTemplate } from 'shared/compile-template'
import { isRequiredComponent } from 'shared/validators'
import extractInstanceOptions from './extract-instance-options'
import createFunctionalComponent from './create-functional-component'
import { componentNeedsCompiling, isPlainObject } from 'shared/validators'
import { validateSlots } from './validate-slots'
import createScopedSlots from './create-scoped-slots'
import { extendExtendedComponents } from './extend-extended-components'

function compileTemplateForSlots (slots: Object): void {
  Object.keys(slots).forEach(key => {
    const slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]]
    slot.forEach(slotValue => {
      if (componentNeedsCompiling(slotValue)) {
        compileTemplate(slotValue)
      }
    })
  })
}

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

  // Replace globally registered components with components extended
  // from localVue. This makes sure the beforeMount mixins to add stubs
  // is applied to globally registered components.
  // Vue version must be 2.3 or greater, because of a bug resolving
  // extended constructor options (https://github.com/vuejs/vue/issues/4976)
  if (vueVersion > 2.2) {
    for (const c in _Vue.options.components) {
      if (!isRequiredComponent(c)) {
        _Vue.component(c, _Vue.extend(_Vue.options.components[c]))
      }
    }
  }

  const stubComponents = createComponentStubs(
    component.components,
    // $FlowIgnore
    options.stubs
  )

  extendExtendedComponents(
    component,
    _Vue,
    options.logModifiedComponents,
    instanceOptions.components
  )

  // stub components should override every component defined in a component
  if (options.stubs) {
    instanceOptions.components = {
      ...instanceOptions.components,
      ...stubComponents
    }
  }
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

  if (component.options) {
    component.options._base = _Vue
  }

  function getExtendedComponent (component, instanceOptions) {
    const extendedComponent = component.extend(instanceOptions)
    // to keep the possible overridden prototype and _Vue mixins,
    // we need change the proto chains manually
    // @see https://github.com/vuejs/vue-test-utils/pull/856
    // code below equals to
    // `extendedComponent.prototype.__proto__.__proto__ = _Vue.prototype`
    const extendedComponentProto =
      Object.getPrototypeOf(extendedComponent.prototype)
    Object.setPrototypeOf(extendedComponentProto, _Vue.prototype)

    return extendedComponent
  }

  // extend component from _Vue to add properties and mixins
  const Constructor = typeof component === 'function'
    ? getExtendedComponent(component, instanceOptions)
    : _Vue.extend(component).extend(instanceOptions)

  Constructor._vueTestUtilsRoot = component

  Object.keys(instanceOptions.components || {}).forEach(c => {
    Constructor.component(c, instanceOptions.components[c])
  })

  if (options.slots) {
    compileTemplateForSlots(options.slots)
    // $FlowIgnore
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

  if (options.parentComponent && !isPlainObject(options.parentComponent)) {
    throwError(
      `options.parentComponent should be a valid Vue component ` +
      `options object`
    )
  }

  const parentComponentOptions = options.parentComponent || {}
  parentComponentOptions.provide = options.provide
  parentComponentOptions.render = function (h) {
    const slots = options.slots
      ? createSlotVNodes(this, options.slots)
      : undefined
    return h(
      Constructor,
      {
        ref: 'vm',
        on: options.listeners,
        attrs: {
          ...options.attrs,
          // pass as attrs so that inheritAttrs works correctly
          // propsData should take precedence over attrs
          ...options.propsData
        },
        scopedSlots
      },
      slots
    )
  }
  const Parent = _Vue.extend(parentComponentOptions)

  return new Parent()
}
