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
      (typeof stub === 'object' &&
      typeof stub.render === 'function'))
}

function isRequired (name) {
  return name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
}

export function stubComponents (component: Component, stubs: Object): void {
  Object.keys(stubs).forEach(stub => {
    if (!isValidStub(stubs[stub])) {
      throwError('options.stub values must be passed a string or component')
    }

    if (!component.components) {
      component.components = {}
    }

    if (component.components[stub]) {
        // Remove cached constructor
      delete component.components[stub]._Ctor
      if (typeof stubs[stub] === 'string') {
        component.components[stub] = {
          attrs: component.components[stub].attrs,
          name: component.components[stub].name,
          on: component.components[stub].on,
          key: component.components[stub].key,
          ref: component.components[stub].ref,
          props: component.components[stub].props,
          domProps: component.components[stub].domProps,
          class: component.components[stub].class,
          ...compileToFunctions(stubs[stub])
        }
        stubLifeCycleEvents(component.components[stub])
      } else {
        component.components[stub] = {
          ...stubs[stub],
          name: component.components[stub].name
        }
      }
    } else {
      if (typeof stubs[stub] === 'string') {
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
    Vue.config.ignoredElements.push(stub)
  })
}

export function stubAllComponents (component: Component): void {
  Object.keys(component.components).forEach(c => {
        // Remove cached constructor
    delete component.components[c]._Ctor
    component.components[c] = {
      attrs: component.components[c].attrs,
      name: component.components[c].name,
      on: component.components[c].on,
      key: component.components[c].key,
      ref: component.components[c].ref,
      props: component.components[c].props,
      domProps: component.components[c].domProps,
      class: component.components[c].class,
      render: () => {}
    }
    Vue.config.ignoredElements.push(c)
    stubLifeCycleEvents(component.components[c])
  })
}

export function stubGlobalComponents (component: Component, instance: Component) {
  Object.keys(instance.options.components).forEach((c) => {
    if (isRequired(c)) {
      return
    }
    if (!component.components) {
      component.components = {} // eslint-disable-line no-param-reassign
    }

    component.components[c] = { // eslint-disable-line no-param-reassign
      render: () => {},
      attrs: instance.options.components[c].attrs,
      name: instance.options.components[c].name,
      on: instance.options.components[c].on,
      key: instance.options.components[c].key,
      ref: instance.options.components[c].ref,
      props: instance.options.components[c].props,
      domProps: instance.options.components[c].domProps,
      class: instance.options.components[c].class
    }
    delete instance.options.components[c]._Ctor // eslint-disable-line no-param-reassign
    delete component.components[c]._Ctor // eslint-disable-line no-param-reassign
    stubLifeCycleEvents(component.components[c])
  })
}
