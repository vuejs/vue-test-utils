// @flow

import { createSlotVNodes } from './create-slot-vnodes'
import addMocks from './add-mocks'
import { addEventLogger } from './log-events'
import { addStubs } from './add-stubs'
import { throwError, vueVersion } from 'shared/util'
import {
  compileTemplate,
  compileTemplateForSlots
} from 'shared/compile-template'
import { isRequiredComponent } from 'shared/validators'
import extractInstanceOptions from './extract-instance-options'
import createFunctionalComponent from './create-functional-component'
import { componentNeedsCompiling, isPlainObject } from 'shared/validators'
import { validateSlots } from './validate-slots'
import createScopedSlots from './create-scoped-slots'
import { extendExtendedComponents } from './extend-extended-components'
import Vue from 'vue'

function vueExtendUnsupportedOption (option: string) {
  return `options.${option} is not supported for ` +
  `components created with Vue.extend in Vue < 2.3. ` +
  `You can set ${option} to false to mount the component.`
}

// these options aren't supported if Vue is version < 2.3
// for components using Vue.extend. This is due to a bug
// that means the mixins we use to add properties are not applied
// correctly
const UNSUPPORTED_VERSION_OPTIONS = [
  'mocks',
  'stubs',
  'localVue'
]

export default function createInstance (
  component: Component,
  options: Options
): Component {
  // Remove cached constructor
  delete component._Ctor

  const _Vue = options.localVue
    ? options.localVue.extend()
    : Vue.extend()

  // make sure all extends are based on this instance
  _Vue.options._base = _Vue

  if (
    vueVersion < 2.3 &&
    typeof component === 'function' &&
    component.options
  ) {
    UNSUPPORTED_VERSION_OPTIONS.forEach((option) => {
      if (options[option]) {
        throwError(vueExtendUnsupportedOption(option))
      }
    })
  }

  // instance options are options that are passed to the
  // root instance when it's instantiated
  const instanceOptions = extractInstanceOptions(options)

  addEventLogger(_Vue)
  addMocks(options.mocks, _Vue)
  addStubs(component, options.stubs, _Vue)

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

  extendExtendedComponents(
    component,
    _Vue,
    options.logModifiedComponents,
    instanceOptions.components
  )

  if (component.options) {
    component.options._base = _Vue
  }

  // extend component from _Vue to add properties and mixins
  // extend does not work correctly for sub class components in Vue < 2.2
  const Constructor = typeof component === 'function' && vueVersion < 2.3
    ? component.extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions)

  // Keep reference to component mount was called with
  Constructor._vueTestUtilsRoot = component

  // used to identify extended component using constructor
  Constructor.options.$_vueTestUtils_original = component
  if (options.slots) {
    compileTemplateForSlots(options.slots)
    // validate slots outside of the createSlots function so
    // that we can throw an error without it being caught by
    // the Vue error handler
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
