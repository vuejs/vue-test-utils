// @flow

import './warn-if-no-window'
import Vue from 'vue'
import mount from './mount'
import type VueWrapper from './vue-wrapper'
import {
  createComponentStubsForAll,
  createComponentStubsForGlobals,
  createBlankStub
} from 'shared/stub-components'
import { camelize, capitalize, hyphenate } from 'shared/util'

export default function shallowMount (
  component: Component,
  options: Options = {}
): VueWrapper {
  const _Vue = options.localVue || Vue

  // remove any recursive components added to the constructor
  // in vm._init from previous tests
  if (component.name && component.components) {
    delete component.components[capitalize(camelize(component.name))]
    delete component.components[hyphenate(component.name)]
  }

  if(!options.stubs) {
    options.stubs = {}
  }

  // In Vue.extends, Vue adds a recursive component to the options
  // This stub will override the component added by Vue
  if (!options.stubs[component.name]) {
    options.stubs[component.name] = createBlankStub(component, component.name)
  }

  return mount(component, {
    ...options,
    components: {
      ...createComponentStubsForGlobals(_Vue),
      ...createComponentStubsForAll(component)
    }
  })
}
