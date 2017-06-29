// @flow

import Vue from 'vue'
import { cloneDeep } from 'lodash'
import mount from './mount'
import type VueWrapper from './wrappers/vue-wrapper'

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
    component[hook] = () => {}
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
  const clonedComponent = cloneDeep(component)
  if (clonedComponent.components) {
    replaceComponents(clonedComponent)
  }

  return mount(clonedComponent, options)
}

