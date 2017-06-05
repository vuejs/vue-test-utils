import Wrapper from './Wrapper'

function update () {
  this._update(this._render())
}

export default class VueWrapper extends Wrapper {
  constructor (vm, mountedToDom) {
    super(vm._vnode, update.bind(vm), mountedToDom)

    this.vm = vm

    this.isVueComponent = true
  }
}
