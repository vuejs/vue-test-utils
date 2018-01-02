// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from './util'

function isValidStub (stub: any) {
  return !!stub &&
      (typeof stub === 'string' ||
      (stub === true) ||
      (typeof stub === 'object' &&
      typeof stub.render === 'function'))
}

function isRequiredComponent (name) {
  return name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
}

function getCoreProperties (component: Component): Object {
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
    nativeOn: component.nativeOn
  }
}
function createStubFromString (templateString: string, originalComponent: Component): Object {
  if (!compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
  }
  return {
    ...getCoreProperties(originalComponent),
    ...compileToFunctions(templateString)
  }
}

function createBlankStub (originalComponent: Component) {
  return {
    ...getCoreProperties(originalComponent),
    render: () => {}
  }
}

export function createComponentStubs (originalComponents: Object = {}, stubs: Object): Object {
  const components = {}
  if (!stubs) {
    return components
  }
  if (Array.isArray(stubs)) {
    stubs.forEach(stub => {
      if (stub === false) {
        return
      }

      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string')
      }
      components[stub] = createBlankStub({})
    })
  } else {
    Object.keys(stubs).forEach(stub => {
      if (stubs[stub] === false) {
        return
      }
      if (!isValidStub(stubs[stub])) {
        throwError('options.stub values must be passed a string or component')
      }
      if (stubs[stub] === true) {
        components[stub] = createBlankStub({})
        return
      }
      if (originalComponents[stub]) {
        // Remove cached constructor
        delete originalComponents[stub]._Ctor
        if (typeof stubs[stub] === 'string') {
          components[stub] = createStubFromString(stubs[stub], originalComponents[stub])
        } else {
          components[stub] = {
            ...stubs[stub],
            name: originalComponents[stub].name
          }
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!compileToFunctions) {
            throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
          }
          components[stub] = {
            ...compileToFunctions(stubs[stub])
          }
        } else {
          components[stub] = {
            ...stubs[stub]
          }
        }
      }
      // ignoreElements does not exist in Vue 2.0.x
      if (Vue.config.ignoredElements) {
        Vue.config.ignoredElements.push(stub)
      }
    })
  }
  return components
}

export function createComponentStubsForAll (component: Component): Object {
  const components = {}
  if (!component.components) {
    return components
  }
  Object.keys(component.components).forEach(c => {
    // Remove cached constructor
    delete component.components[c]._Ctor
    if (!component.components[c].name) {
      component.components[c].name = c
    }
    components[c] = createBlankStub(component.components[c])

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue.config.ignoredElements) {
      Vue.config.ignoredElements.push(c)
    }
  })
  return components
}

export function createComponentStubsForGlobals (instance: Component): Object {
  const components = {}
  Object.keys(instance.options.components).forEach((c) => {
    if (isRequiredComponent(c)) {
      return
    }

    components[c] = createBlankStub(instance.options.components[c])
    delete instance.options.components[c]._Ctor // eslint-disable-line no-param-reassign
    delete components[c]._Ctor // eslint-disable-line no-param-reassign
  })
  return components
}
