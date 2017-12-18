// @flow

import Wrapper from './wrapper'
import addSlots from '../lib/add-slots'
import cloneDeep from 'lodash/cloneDeep'

function update () {
  // the only component made by mount()
  if (this.$_originalSlots) {
    this.$slots = cloneDeep(this.$_originalSlots)
  }
  if (this.$_mountingOptionsSlots) {
    addSlots(this, this.$_mountingOptionsSlots)
  }
  const vnodes = this._render()
  this._update(vnodes)
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
    this._emitted = vm.__emitted
    this._emittedByOrder = vm.__emittedByOrder
  }
}
