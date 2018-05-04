// @flow

import './warn-if-no-window'
import Vue from 'vue'
import mount from './mount'
import type VueWrapper from './vue-wrapper'
import {
  createComponentStubsForAll,
  createComponentStubsForGlobals
} from 'shared/stub-components'
import { camelize,
  capitalize,
  hyphenate
} from 'shared/util'

export default function shallow (
  component: Component,
  options: Options = {}
): VueWrapper {
  const vue = options.localVue || Vue

  // remove any recursive components added to the constructor
  // in vm._init from previous tests
  if (component.name && component.components) {
    delete component.components[capitalize(camelize(component.name))]
    delete component.components[hyphenate(component.name)]
  }

  const stubbedComponents = createComponentStubsForAll(component)
  const stubbedGlobalComponents = createComponentStubsForGlobals(vue)

  return mount(component, {
    ...options,
    components: {
      // stubbed components are used instead of original components components
      ...stubbedGlobalComponents,
      ...stubbedComponents
    }
  })
}
