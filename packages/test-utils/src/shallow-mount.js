// @flow

import './warn-if-no-window'
import Vue from 'vue'
import mount from './mount'
import type VueWrapper from './vue-wrapper'
import {
  createStubsForComponent,
  createComponentStubsForGlobals,
  createStubFromComponent
} from '../../shared/create-component-stubs'
import { normalizeStubs } from '../../shared/normalize'

export default function shallowMount (
  component: Component,
  options: Options = {}
): VueWrapper {
  const _Vue = options.localVue || Vue

  options.stubs = normalizeStubs(options.stubs)

  // In Vue.extends, Vue adds a recursive component to the options
  // This stub will override the component added by Vue
  // $FlowIgnore
  if (!options.stubs[component.name]) {
    // $FlowIgnore
    options.stubs[component.name] = createStubFromComponent(
      component,
      component.name
    )
  }

  return mount(component, {
    ...options,
    components: {
      ...createComponentStubsForGlobals(_Vue),
      ...createStubsForComponent(component)
    }
  })
}
