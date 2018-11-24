// @flow

import mount from './mount'
import type VueWrapper from './vue-wrapper'

export default function shallowMount (
  component: Component,
  options: Options = {}
): VueWrapper {
  return mount(component, {
    ...options,
    shouldProxy: true
  })
}
