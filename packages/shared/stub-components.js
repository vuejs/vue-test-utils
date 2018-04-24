// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { validateStubOptions } from 'shared/stub-components-validate'
import { componentNeedsCompiling } from 'shared/validators'
import { compileTemplate } from 'shared/compile-template'

function getCoreProperties (component: Component): Object {
  if (!component) return {}
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
    functional: component.functional
  }
}

function createStubFromString (originalComponent: Component, template: string): Object {
  return {
    ...getCoreProperties(originalComponent),
    ...compileToFunctions(template)
  }
}

function createBlankStub (originalComponent: Component): Object {
  return {
    ...getCoreProperties(originalComponent),
    render: h => h('')
  }
}

function createStubFromComponent (component: Component, name: string): Object {
  if (componentNeedsCompiling(component)) compileTemplate(component)
  return name ? { ...component, name } : component
}

function createStub (originalComponent: Component, stubValue): Object {
  if (stubValue === true) {
    return createBlankStub(originalComponent)
  } else if (typeof stubValue === 'string') {
    return createStubFromString(originalComponent, stubValue)
  } else {
    return createStubFromComponent(stubValue, originalComponent && originalComponent.name)
  }
}

function normalizeStubOptions (components: ?Object, stubOptions: ?Object | Array<string>): Object {
  if (!stubOptions) {
    stubOptions = Object.keys(components || {})
  }
  if (Array.isArray(stubOptions)) {
    stubOptions = stubOptions.reduce((object, name) => {
      object[name] = true
      return object
    }, {})
  }
  return stubOptions
}

export function createComponentStubs (components: Object = {}, stubOptions: Object): Object {
  validateStubOptions(stubOptions)
  return createStubs(components, stubOptions)
}

export function createComponentStubsForAll (component: Component, stubs: Object = {}): Object {
  if (!component) return stubs
  Object.assign(stubs, createStubs(component.components))
  return createComponentStubsForAll(component.extends || component.extendOptions, stubs)
}

export function createStubs (components: Object, stubOptions: ?Object | Array<string>): Object {
  const options: Object = normalizeStubOptions(components, stubOptions)

  return Object.keys(options)
    .filter(name => !['KeepAlive', 'Transition', 'TransitionGroup'].includes(name))
    .filter(name => options[name] !== false)
    .reduce((stubs, name) => {
      stubs[name] = createStub(components[name], options[name])
      return stubs
    }, {})
}
