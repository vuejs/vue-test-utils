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

export function stubComponents (component: Component, stubs: Object): void {
  Object.keys(stubs).forEach(stub => {
    if (!isValidStub(stubs[stub])) {
      throwError('options.stub values must be passed a string or component')
    }

    if (!component.components) {
      return
    }

    if (typeof component.components[stub] === 'undefined') {
      throwError('options.stub values must be passed a string or component')
    }
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
      Vue.config.ignoredElements.push(stub)
    }
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

