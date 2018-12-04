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
import extractInstanceOptions from './extract-instance-options'
import createFunctionalComponent from './create-functional-component'
import {
  componentNeedsCompiling,
  componentHasProperty,
  isPlainObject
} from 'shared/validators'
import { validateSlots } from './validate-slots'
import createScopedSlots from './create-scoped-slots'
import { createStubsFromStubsObject } from './create-component-stubs'
import { patchRender } from './patch-render'

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
  options: Options,
  _Vue: Component
): Component {
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
  const stubComponentsObject = createStubsFromStubsObject(
    component.components,
    // $FlowIgnore
    options.stubs
  )

  addEventLogger(_Vue)
  addMocks(_Vue, options.mocks)
  addStubs(_Vue, stubComponentsObject)
  patchRender(_Vue, stubComponentsObject, options.shouldProxy)

  if (
    (component.options && component.options.functional) ||
    componentHasProperty(component, 'functional')
  ) {
    component = createFunctionalComponent(component, options)
  } else if (options.context) {
    throwError(
      `mount.context can only be used when mounting a ` +
      `functional component`
    )
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component)
  }

  if (component.options) {
    component.options._base = _Vue
  }

  // extend component from _Vue to add properties and mixins
  // extend does not work correctly for sub class components in Vue < 2.2
  const Constructor = typeof component === 'function'
    ? _Vue.extend(component.options).extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions)

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
  parentComponentOptions.$_doNotStubChildren = true

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
