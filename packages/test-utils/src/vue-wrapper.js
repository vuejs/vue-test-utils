// @flow

import Wrapper from './wrapper'
import { setWatchersToSync } from './set-watchers-to-sync'
import { orderWatchers } from './order-watchers'

export default class VueWrapper extends Wrapper implements BaseWrapper {
  constructor (vm: Component, options: WrapperOptions) {
    super(vm._vnode, options)

    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'vnode', {
      get: () => vm._vnode,
      set: () => {}
    })
    // $FlowIgnore
    Object.defineProperty(this, 'element', {
      get: () => vm.$el,
      set: () => {}
    })
    // $FlowIgnore
    Object.defineProperty(this, 'vm', {
      get: () => vm,
      set: () => {}
    })
    if (options.sync) {
      setWatchersToSync(vm)
      orderWatchers(vm)
    }
    this.isVm = true
    this.isFunctionalComponent = vm.$options._isFunctionalContainer
    this._emitted = vm.__emitted
    this._emittedByOrder = vm.__emittedByOrder
  }
}
