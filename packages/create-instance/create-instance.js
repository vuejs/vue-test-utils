// @flow

import { createSlotVNodes } from './create-slot-vnodes'
import addMocks from './add-mocks'
import { addEventLogger } from './log-events'
import { addStubs } from './add-stubs'
import { compileTemplate } from 'shared/compile-template'
import extractInstanceOptions from './extract-instance-options'
import { componentNeedsCompiling, isConstructor } from 'shared/validators'
import createScopedSlots from './create-scoped-slots'
import { createStubsFromStubsObject } from './create-component-stubs'
import { patchCreateElement } from './patch-create-element'

function createContext(options, scopedSlots, currentProps) {
  const on = {
    ...(options.context && options.context.on),
    ...options.listeners
  }
  return {
    attrs: {
      ...options.attrs,
      // pass as attrs so that inheritAttrs works correctly
      // props should take precedence over attrs
      ...currentProps
    },
    ...(options.context || {}),
    on,
    scopedSlots
  }
}

function createChildren(vm, h, { slots, context }) {
  const slotVNodes = slots ? createSlotVNodes(vm, slots) : undefined
  return (
    (context &&
      context.children &&
      context.children.map(x => (typeof x === 'function' ? x(h) : x))) ||
    slotVNodes
  )
}

function getValuesFromCallableOption(optionValue) {
  if (typeof optionValue === 'function') {
    return optionValue.call(this)
  }
  return optionValue
}

export default function createInstance(
  component: Component,
  options: NormalizedOptions,
  _Vue: Component
): Component {
  const componentOptions = isConstructor(component)
    ? component.options
    : component

  // instance options are options that are passed to the
  // root instance when it's instantiated
  const instanceOptions = extractInstanceOptions(options)

  const globalComponents = _Vue.options.components || {}
  const componentsToStub = Object.assign(
    Object.create(globalComponents),
    componentOptions.components
  )

  const stubComponentsObject = createStubsFromStubsObject(
    componentsToStub,
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

  // watchers provided in mounting options should override preexisting ones
  if (componentOptions.watch && instanceOptions.watch) {
    const componentWatchers = Object.keys(componentOptions.watch)
    const instanceWatchers = Object.keys(instanceOptions.watch)

    for (let i = 0; i < instanceWatchers.length; i++) {
      const k = instanceWatchers[i]
      // override the componentOptions with the one provided in mounting options
      if (componentWatchers.includes(k)) {
        componentOptions.watch[k] = instanceOptions.watch[k]
      }
    }
  }

  // make sure all extends are based on this instance
  const Constructor = _Vue.extend(componentOptions).extend(instanceOptions)
  Constructor.options._base = _Vue

  const scopedSlots = createScopedSlots(options.scopedSlots, _Vue)

  const parentComponentOptions = options.parentComponent || {}

  const originalParentComponentProvide = parentComponentOptions.provide
  parentComponentOptions.provide = function() {
    return {
      ...getValuesFromCallableOption.call(this, originalParentComponentProvide),
      // $FlowIgnore
      ...getValuesFromCallableOption.call(this, options.provide)
    }
  }

  const originalParentComponentData = parentComponentOptions.data
  parentComponentOptions.data = function() {
    return {
      ...getValuesFromCallableOption.call(this, originalParentComponentData),
      vueTestUtils_childProps: { ...options.propsData }
    }
  }

  parentComponentOptions.$_doNotStubChildren = true
  parentComponentOptions.$_isWrapperParent = true
  parentComponentOptions._isFunctionalContainer = componentOptions.functional
  parentComponentOptions.render = function(h) {
    return h(
      Constructor,
      createContext(options, scopedSlots, this.vueTestUtils_childProps),
      createChildren(this, h, options)
    )
  }

  // options  "propsData" can only be used during instance creation with the `new` keyword
  // "data" should be set only on component under test to avoid reactivity issues
  const { propsData, data, ...rest } = options // eslint-disable-line
  const Parent = _Vue.extend({
    ...rest,
    ...parentComponentOptions
  })

  return new Parent()
}
