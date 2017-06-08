// @flow

import ShallowWrapper from './ShallowWrapper'

export default class VueWrapper extends ShallowWrapper implements BaseWrapper {
  isVueComponent: boolean

  constructor () {
    super()
    this.isVueComponent = true
  }
}
