// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from './util'

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated'
]

function stubLifeCycleEvents (component: Component): void {
  LIFECYCLE_HOOKS.forEach((hook) => {
    component[hook] = () => {} // eslint-disable-line no-param-reassign
  })
}

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

function getCoreProperties (component: Component) {
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
function createStubFromString (templateString: string, originalComponent: Component): void {
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

export function stubComponents (component: Component, stubs: Object): void {
  if (!component.components) {
    component.components = {}
  }

  if (Array.isArray(stubs)) {
    stubs.forEach(stub => {
      if (stub === false) {
        return
      }

      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string')
      }
      component.components[stub] = createBlankStub({})
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
        component.components[stub] = createBlankStub({})
        return
      }
      if (component.components[stub]) {
        // Remove cached constructor
        delete component.components[stub]._Ctor
        if (typeof stubs[stub] === 'string') {
          component.components[stub] = createStubFromString(stubs[stub], component.components[stub])
          stubLifeCycleEvents(component.components[stub])
        } else {
          component.components[stub] = {
            ...stubs[stub],
            name: component.components[stub].name
          }
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!compileToFunctions) {
            throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
          }
          component.components[stub] = {
            ...compileToFunctions(stubs[stub])
          }
          stubLifeCycleEvents(component.components[stub])
        } else {
          component.components[stub] = {
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
}

export function stubAllComponents (component: Component): void {
  Object.keys(component.components).forEach(c => {
    // Remove cached constructor
    delete component.components[c]._Ctor
    component.components[c] = createBlankStub(component.components[c])

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue.config.ignoredElements) {
      Vue.config.ignoredElements.push(c)
    }
    stubLifeCycleEvents(component.components[c])
  })
}

export function stubGlobalComponents (component: Component, instance: Component) {
  Object.keys(instance.options.components).forEach((c) => {
    if (isRequiredComponent(c)) {
      return
    }

    if (!component.components) {
      component.components = {} // eslint-disable-line no-param-reassign
    }

    component.components[c] = createBlankStub(instance.options.components[c])
    delete instance.options.components[c]._Ctor // eslint-disable-line no-param-reassign
    delete component.components[c]._Ctor // eslint-disable-line no-param-reassign
    stubLifeCycleEvents(component.components[c])
  })
}
