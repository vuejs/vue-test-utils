// @flow

import Vue from 'vue'
import ShallowVueWrapper from './ShallowVueWrapper'

Vue.config.productionTip = false

export default function mount (): ShallowVueWrapper {
  return new ShallowVueWrapper()
}
