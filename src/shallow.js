// @flow

import './lib/warn-if-no-window'
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import {
  stubAllComponents,
  stubGlobalComponents
} from './lib/stub-components'
import mount from './mount'
import type VueWrapper from './wrappers/vue-wrapper'

export default function shallow (component: Component, options: Options = {}): VueWrapper {
  const vue = options.localVue || Vue
  const clonedComponent = cloneDeep(component.extend ? component.options : component)

  if (clonedComponent.components) {
    stubAllComponents(clonedComponent)
  }

  stubGlobalComponents(clonedComponent, vue)

  return mount(clonedComponent, options)
}
