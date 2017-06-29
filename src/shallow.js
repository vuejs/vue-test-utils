// @flow

import { cloneDeep } from 'lodash'
import { stubAllComponents } from './lib/stub-components'
import mount from './mount'
import type VueWrapper from './wrappers/vue-wrapper'

export default function shallow (component: Component, options: Object): VueWrapper {
  const clonedComponent = cloneDeep(component)
  if (clonedComponent.components) {
    stubAllComponents(clonedComponent)
  }

  return mount(clonedComponent, options)
}

