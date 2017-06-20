// @flow

import mount from './mount'
import type VueWrapper from './VueWrapper'
import Vue from 'vue'

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

function replaceComponents (component: Component): void {
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

export default function shallow (component: Component, options: Object): VueWrapper {
  if (component.components) {
    replaceComponents(component)
  }

  return mount(component, options)
}

