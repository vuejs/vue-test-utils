// @flow

import { throwError } from 'shared/util'

export default class ErrorWrapper implements BaseWrapper {
  selector: string;

  constructor (selector: string) {
    this.selector = selector
  }

  at (): void {
    throwError(`find did not return ${this.selector}, cannot call at() on empty Wrapper`)
  }

  attributes (): void {
    throwError(`find did not return ${this.selector}, cannot call attributes() on empty Wrapper`)
  }

  classes (): void {
    throwError(`find did not return ${this.selector}, cannot call classes() on empty Wrapper`)
  }

  contains (): void {
    throwError(`find did not return ${this.selector}, cannot call contains() on empty Wrapper`)
  }

  emitted (): void {
    throwError(`find did not return ${this.selector}, cannot call emitted() on empty Wrapper`)
  }

  emittedByOrder (): void {
    throwError(`find did not return ${this.selector}, cannot call emittedByOrder() on empty Wrapper`)
  }

  exists (): boolean {
    return false
  }

  filter (): void {
    throwError(`find did not return ${this.selector}, cannot call filter() on empty Wrapper`)
  }

  visible (): void {
    throwError(`find did not return ${this.selector}, cannot call visible() on empty Wrapper`)
  }

  hasAttribute (): void {
    throwError(`find did not return ${this.selector}, cannot call hasAttribute() on empty Wrapper`)
  }

  hasClass (): void {
    throwError(`find did not return ${this.selector}, cannot call hasClass() on empty Wrapper`)
  }

  hasProp (): void {
    throwError(`find did not return ${this.selector}, cannot call hasProp() on empty Wrapper`)
  }

  hasStyle (): void {
    throwError(`find did not return ${this.selector}, cannot call hasStyle() on empty Wrapper`)
  }

  findAll (): void {
    throwError(`find did not return ${this.selector}, cannot call findAll() on empty Wrapper`)
  }

  find (): void {
    throwError(`find did not return ${this.selector}, cannot call find() on empty Wrapper`)
  }

  html (): void {
    throwError(`find did not return ${this.selector}, cannot call html() on empty Wrapper`)
  }

  is (): void {
    throwError(`find did not return ${this.selector}, cannot call is() on empty Wrapper`)
  }

  isEmpty (): void {
    throwError(`find did not return ${this.selector}, cannot call isEmpty() on empty Wrapper`)
  }

  isVueInstance (): void {
    throwError(`find did not return ${this.selector}, cannot call isVueInstance() on empty Wrapper`)
  }

  name (): void {
    throwError(`find did not return ${this.selector}, cannot call name() on empty Wrapper`)
  }

  props (): void {
    throwError(`find did not return ${this.selector}, cannot call props() on empty Wrapper`)
  }

  text (): void {
    throwError(`find did not return ${this.selector}, cannot call text() on empty Wrapper`)
  }

  setComputed (): void {
    throwError(`find did not return ${this.selector}, cannot call setComputed() on empty Wrapper`)
  }

  setData (): void {
    throwError(`find did not return ${this.selector}, cannot call setData() on empty Wrapper`)
  }

  setMethods (): void {
    throwError(`find did not return ${this.selector}, cannot call setMethods() on empty Wrapper`)
  }

  setProps (): void {
    throwError(`find did not return ${this.selector}, cannot call setProps() on empty Wrapper`)
  }

  trigger (): void {
    throwError(`find did not return ${this.selector}, cannot call trigger() on empty Wrapper`)
  }

  update (): void {
    throwError(`find did not return ${this.selector}, cannot call update() on empty Wrapper`)
  }

  destroy (): void {
    throwError(`find did not return ${this.selector}, cannot call destroy() on empty Wrapper`)
  }
}
