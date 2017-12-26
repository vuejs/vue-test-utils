// @flow

import './lib/warn-if-no-window'
import Vue from 'vue'
import {
  createComponentStubsForAll,
  createComponentStubsForGlobals
} from './lib/stub-components'
import mount from './mount'
import type VueWrapper from './wrappers/vue-wrapper'

export default function shallow (
  component: Component,
  options: Options = {}
): VueWrapper {
  const vue = options.localVue || Vue
  const stubbedComponents = createComponentStubsForAll(component)
  const stubbedGlobalComponents = createComponentStubsForGlobals(vue)

  return mount(component, {
    ...options,
    components: {
      // stubbed components are used instead of original components components
      ...stubbedGlobalComponents,
      ...stubbedComponents,
      ...options
    }
  })
}
