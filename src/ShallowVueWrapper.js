// @flow

import ShallowWrapper from './ShallowWrapper'

export default class VueWrapper extends ShallowWrapper implements BaseWrapper {
  isVueComponent: boolean

  constructor (vm: Component) {
    super(vm._render())
    this.isVueComponent = true
    this.vm = vm
  }
}
