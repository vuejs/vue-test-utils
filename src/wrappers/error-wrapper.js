// @flow

export default class ErrorWrapper implements BaseWrapper {
  selector: string;

  constructor (selector: string) {
    this.selector = selector
  }

  at (): void {
    throw new Error(`find did not return ${this.selector}, cannot call at() on empty Wrapper`)
  }

  contains (): void {
    throw new Error(`find did not return ${this.selector}, cannot call contains() on empty Wrapper`)
  }

  hasAttribute (): void {
    throw new Error(`find did not return ${this.selector}, cannot call hasAttribute() on empty Wrapper`)
  }

  hasClass (): void {
    throw new Error(`find did not return ${this.selector}, cannot call hasClass() on empty Wrapper`)
  }

  hasProp (): void {
    throw new Error(`find did not return ${this.selector}, cannot call hasProp() on empty Wrapper`)
  }

  hasStyle (): void {
    throw new Error(`find did not return ${this.selector}, cannot call hasStyle() on empty Wrapper`)
  }

  findAll (): void {
    throw new Error(`find did not return ${this.selector}, cannot call findAll() on empty Wrapper`)
  }

  find (): void {
    throw new Error(`find did not return ${this.selector}, cannot call find() on empty Wrapper`)
  }

  html (): void {
    throw new Error(`find did not return ${this.selector}, cannot call html() on empty Wrapper`)
  }

  is (): void {
    throw new Error(`find did not return ${this.selector}, cannot call is() on empty Wrapper`)
  }

  isEmpty (): void {
    throw new Error(`find did not return ${this.selector}, cannot call isEmpty() on empty Wrapper`)
  }

  isVueInstance (): void {
    throw new Error(`find did not return ${this.selector}, cannot call isVueInstance() on empty Wrapper`)
  }

  name (): void {
    throw new Error(`find did not return ${this.selector}, cannot call name() on empty Wrapper`)
  }

  text (): void {
    throw new Error(`find did not return ${this.selector}, cannot call text() on empty Wrapper`)
  }

  setData (): void {
    throw new Error(`find did not return ${this.selector}, cannot call setData() on empty Wrapper`)
  }

  setProps (): void {
    throw new Error(`find did not return ${this.selector}, cannot call setProps() on empty Wrapper`)
  }

  trigger (): void {
    throw new Error(`find did not return ${this.selector}, cannot call trigger() on empty Wrapper`)
  }

  update (): void {
    throw new Error(`find did not return ${this.selector}, cannot call update() on empty Wrapper`)
  }
}
