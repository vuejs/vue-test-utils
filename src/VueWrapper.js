// @flow

import Wrapper from './Wrapper'

function update () {
  this._update(this._render())
}

export default class VueWrapper extends Wrapper implements BaseWrapper {
  constructor (vm: Component, options: WrapperOptions) {
    super(vm._vnode, update.bind(vm), options)

    this.vm = vm

    this.isVueComponent = true
  }
}
