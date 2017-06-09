// @flow

import Vue from 'vue'
import ShallowVueWrapper from './ShallowVueWrapper'

Vue.config.productionTip = false

export default function shallow (component: Component): ShallowVueWrapper {
  const Constructor = Vue.extend(component)

  const vm = new Constructor()

  return new ShallowVueWrapper(vm)
}

