// @flow

import Wrapper from './wrapper'
import { logEvents } from '../lib/log-events'

function update () {
  this._update(this._render())
}

export default class VueWrapper extends Wrapper implements BaseWrapper {
  _emitted: { [name: string]: Array<Array<any>> };
  _emittedByOrder: Array<{ name: string; args: Array<any> }>;

  constructor (vm: Component, options: WrapperOptions) {
    super(vm._vnode, update.bind(vm), options)

    // $FlowIgnore : issue with defineProperty - https://github.com/facebook/flow/issues/285
    Object.defineProperty(this, 'vnode', ({
      get: () => vm._vnode,
      set: () => {}
    }))

    this.vm = vm
    this.isVueComponent = true
    this._emitted = Object.create(null)
    this._emittedByOrder = []

    logEvents(vm, this._emitted, this._emittedByOrder)
  }

  emitted () {
    return this._emitted
  }

  emittedByOrder () {
    return this._emittedByOrder
  }
}
