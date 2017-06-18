// @flow

import mount from './mount'
import type VueWrapper from './VueWrapper'
import Vue from 'vue'

function replaceComponents (component) {
  Object.keys(component.components).forEach(c => {
    // Remove cached constructor
    delete component.components[c]._Ctor
    component.components[c] = {
      ...component.components[c],
      render: () => {}
    }
    Vue.config.ignoredElements.push(c)
  })
}

export default function shallow (component: Component, options: Object): VueWrapper {
  if (component.components) {
    replaceComponents(component)
  }

  return mount(component, options)
}

