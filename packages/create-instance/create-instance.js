// @flow

import { createSlotVNodes } from './create-slot-vnodes'
import addMocks from './add-mocks'
import { addEventLogger } from './log-events'
import { addStubs } from './add-stubs'
import { compileTemplate } from 'shared/compile-template'
import extractInstanceOptions from './extract-instance-options'
import {
  componentNeedsCompiling,
  isConstructor
} from 'shared/validators'
import createScopedSlots from './create-scoped-slots'
import { createStubsFromStubsObject } from './create-component-stubs'
import { patchCreateElement } from './patch-create-element'

function createContext (options, scopedSlots) {
  const on = {
    ...(options.context && options.context.on),
    ...options.listeners
  }
  return {
    attrs: {
      ...options.attrs,
      // pass as attrs so that inheritAttrs works correctly
      // propsData should take precedence over attrs
      ...options.propsData
    },
    ...(options.context || {}),
    on,
    scopedSlots
  }
}

function createChildren (vm, h, { slots, context }) {
  const slotVNodes = slots
    ? createSlotVNodes(vm, slots)
    : undefined
  return (
    context &&
    context.children &&
    context.children.map(x => (typeof x === 'function' ? x(h) : x))
  ) || slotVNodes
}

export default function createInstance (
  component: Component,
  options: Options,
  _Vue: Component
): Component {
  const componentOptions = isConstructor(component)
    ? component.options
    : component

  // instance options are options that are passed to the
  // root instance when it's instantiated
  const instanceOptions = extractInstanceOptions(options)

  const stubComponentsObject = createStubsFromStubsObject(
    componentOptions.components,
    // $FlowIgnore
    options.stubs,
    _Vue
  )

  addEventLogger(_Vue)
  addMocks(_Vue, options.mocks)
  addStubs(_Vue, stubComponentsObject)
  patchCreateElement(_Vue, stubComponentsObject, options.shouldProxy)

  if (componentNeedsCompiling(componentOptions)) {
    compileTemplate(componentOptions)
  }

  // used to identify extended component using constructor
  componentOptions.$_vueTestUtils_original = component

  // make sure all extends are based on this instance
  componentOptions._base = _Vue

  const Constructor = _Vue.extend(componentOptions).extend(instanceOptions)

  const scopedSlots = createScopedSlots(options.scopedSlots, _Vue)

  const parentComponentOptions = options.parentComponent || {}

  parentComponentOptions.provide = options.provide
  parentComponentOptions.$_doNotStubChildren = true
  parentComponentOptions._isFunctionalContainer = componentOptions.functional
  parentComponentOptions.render = function (h) {
    return h(
      Constructor,
      createContext(options, scopedSlots),
      createChildren(this, h, options)
    )
  }
  const Parent = _Vue.extend(parentComponentOptions)

  return new Parent()
}
