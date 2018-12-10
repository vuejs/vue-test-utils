// @flow

import Wrapper from './wrapper'
import { throwError } from 'shared/util'
import { setWatchersToSync } from './set-watchers-to-sync'
import { orderWatchers } from './order-watchers'
import { COMPAT_SYNC_MODE } from 'shared/consts'

export default class VueWrapper extends Wrapper implements BaseWrapper {
  constructor (vm: Component, options: WrapperOptions) {
    super(vm._vnode, options, true)
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'rootNode', {
      get: () => vm.$vnode || { child: this.vm },
      set: () => throwError('wrapper.vnode is read-only')
    })
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'vnode', {
      get: () => vm._vnode,
      set: () => throwError('wrapper.vnode is read-only')
    })
    // $FlowIgnore
    Object.defineProperty(this, 'element', {
      get: () => vm.$el,
      set: () => throwError('wrapper.element is read-only')
    })
    // $FlowIgnore
    Object.defineProperty(this, 'vm', {
      get: () => vm,
      set: () => throwError('wrapper.vm is read-only')
    })
    if (options.sync === COMPAT_SYNC_MODE) {
      setWatchersToSync(vm)
      orderWatchers(vm)
    }
    this.isFunctionalComponent = vm.$options._isFunctionalContainer
    this._emitted = vm.__emitted
    this._emittedByOrder = vm.__emittedByOrder
  }
}
