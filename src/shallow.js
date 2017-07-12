// @flow

import Vue from 'vue'
import { cloneDeep } from 'lodash'
import {
  stubAllComponents,
  stubGlobalComponents
} from './lib/stub-components'
import mount from './mount'
import type VueWrapper from './wrappers/vue-wrapper'

export default function shallow (component: Component, options: Object = {}): VueWrapper {
  const instance = options.instance || Vue
  const clonedComponent = cloneDeep(component)

  if (clonedComponent.components) {
    stubAllComponents(clonedComponent)
  }

  stubGlobalComponents(clonedComponent, instance)

  return mount(clonedComponent, options)
}

