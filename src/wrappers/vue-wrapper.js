// @flow

import Wrapper from './wrapper'

function update () {
  this._update(this._render())
  this.$children.forEach(child => update.call(child))
}

export default class VueWrapper extends Wrapper implements BaseWrapper {
  constructor (vm: Component, options: WrapperOptions) {
    super(vm._vnode, update.bind(vm), options)

    // $FlowIgnore : issue with defineProperty - https://github.com/facebook/flow/issues/285
    Object.defineProperty(this, 'vnode', ({
      get: () => vm._vnode,
      set: () => {}
    }))
    // $FlowIgnore
    Object.defineProperty(this, 'element', ({
      get: () => vm.$el,
      set: () => {}
    }))
    this.vm = vm
    this.isVueComponent = true
    this._emitted = options.eventCaptor.emitted
    this._emittedByOrder = options.eventCaptor.emittedByOrder

    // logEvents(vm, this._emitted, this._emittedByOrder)
  }
}
