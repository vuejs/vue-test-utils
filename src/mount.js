// @flow

import Vue from 'vue'
import VueWrapper from './wrappers/vue-wrapper'
import createInstance from './lib/create-instance'
import { throwError } from './lib/util'
import cloneDeep from 'lodash/cloneDeep'
import createElement from './lib/create-element'
import './lib/matches-polyfill'

Vue.config.productionTip = false

export default function mount (component: Component, options: Options = {}): VueWrapper {
  if (!window) {
    throwError(
      'window is undefined, vue-test-utils needs to be run in a browser environment.\n' +
      'You can run the tests in node using jsdom + jsdom-global.\n' +
      'See https://vue-test-utils.vuejs.org/en/guides/common-tips.html for more details.'
    )
  }

  const componentToMount = options.clone === false ? component : cloneDeep(component)
  // Remove cached constructor
  delete componentToMount._Ctor

  const vm = createInstance(componentToMount, options)

  if (options.attachToDocument) {
    vm.$mount(createElement())
  } else {
    vm.$mount()
  }

  return new VueWrapper(vm, { attachedToDocument: !!options.attachToDocument })
}
