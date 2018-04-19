// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { validateStubOptions } from 'shared/stub-components-validation'
import { componentNeedsCompiling } from 'shared/validators'
import { compileTemplate } from 'shared/compile-template'

export function createComponentStubsForGlobals (vueInstance: Component) {
  return createBlankStubs(vueInstance.options.components)
}

export function createComponentStubsForAll (component: Component) {
  return createComponentStubsRecursively(component)
}

export function createComponentStubs (components: Object = {}, stubOptions: Object = {}): Object {
  validateStubOptions(stubOptions, components)
  return Array.isArray(stubOptions)
    ? createBlankStubs(stubOptions)
    : createStubsFromObject(stubOptions, components)
}

function createComponentStubsRecursively (component: Component, stubs: Object = {}): Object {
  if (!component) return stubs
  stubs = Object.assign(stubs, createBlankStubs(component.components, true))
  return createComponentStubsRecursively(component.extends || component.extendOptions, stubs)
}

function createBlankStubs (components, addToIgnored = false) {
  return (Array.isArray(components) ? components : Object.keys(components || {}))
    .filter(name => !['KeepAlive', 'Transition', 'TransitionGroup'].includes(name))
    .reduce((stubs, name) => {
      stubs[name] = createStub(components[name])
      if (addToIgnored) addToIgnoredElements(name)
      return stubs
    }, {})
}

function createStubsFromObject (stubOptions, components) {
  return Object.keys(stubOptions)
    .filter(name => stubOptions[name] !== false)
    .reduce((stubs, name) => {
      const stubValue: string | Component = stubOptions[name]
      const component = components[name] || {}

      if (stubValue === true) {
        stubs[name] = createStub(component)
      } else if (typeof stubValue === 'string') {
        stubs[name] = createStub(component, compileToFunctions(stubValue))
      } else {
        if (componentNeedsCompiling(stubValue)) compileTemplate(stubValue)
        stubs[name] = Object.assign({}, stubValue, component.name ? { name: component.name } : {})
      }
      addToIgnoredElements(name)
      return stubs
    }, {})
}

function createStub (component = {}, properties = {}) {
  return {
    attrs: component.attrs,
    name: component.name,
    on: component.on,
    key: component.key,
    ref: component.ref,
    props: component.props,
    domProps: component.domProps,
    class: component.class,
    staticClass: component.staticClass,
    staticStyle: component.staticStyle,
    style: component.style,
    normalizedStyle: component.normalizedStyle,
    nativeOn: component.nativeOn,
    functional: component.functional,
    render: h => h(''),
    ...properties
  }
}

function addToIgnoredElements (name) {
  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(name)
  }
}
