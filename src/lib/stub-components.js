// @flow
import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'

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

export function stubComponents (component: Component, stubs: Object): void {
  Object.keys(stubs).forEach(stub => {
        // Remove cached constructor
    delete component.components[stub]._Ctor
    component.components[stub] = {
      ...component.components[stub],
      ...compileToFunctions(stubs[stub])
    }
    Vue.config.ignoredElements.push(stub)
    stubLifeCycleEvents(component.components[stub])
  })
}

export function stubAllComponents (component: Component): void {
  Object.keys(component.components).forEach(c => {
        // Remove cached constructor
    delete component.components[c]._Ctor
    component.components[c] = {
      ...component.components[c],
      render: () => {}
    }
    Vue.config.ignoredElements.push(c)
    stubLifeCycleEvents(component.components[c])
  })
}
