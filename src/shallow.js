// @flow

import mount from './mount'
import type VueWrapper from './VueWrapper'

export default function shallow (component: Component, options: Object): VueWrapper {
  return mount(component, options)
}

