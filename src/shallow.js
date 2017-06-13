// @flow

import Vue from 'vue'
import ShallowVueWrapper from './ShallowVueWrapper'

Vue.config.productionTip = false

export default function shallow (component: Component, options: Object): ShallowVueWrapper {
  const Constructor = Vue.extend(component)

  const vm = new Constructor(options)

  return new ShallowVueWrapper(vm)
}

