// @flow
import type Wrapper from './Wrapper'
import type VueWrapper from './VueWrapper'

export default class WrapperArray {
  wrappers: Array<Wrapper | VueWrapper>;
  length: number;

  constructor (wrappers: Array<Wrapper | VueWrapper>) {
    this.wrappers = wrappers || []
    this.length = this.wrappers.length
  }

  at (index: number): Wrapper | VueWrapper {
    return this.wrappers[index]
  }

  contains (selector: string | Component): boolean {
    return this.wrappers.every(wrapper => wrapper.contains(selector))
  }

  hasAttribute (attribute: string, value: string): boolean {
    return this.wrappers.every(wrapper => wrapper.hasAttribute(attribute, value))
  }

  hasClass (className: string): boolean {
    return this.wrappers.every(wrapper => wrapper.hasClass(className))
  }

  hasProp (prop: string, value: string): boolean {
    return this.wrappers.every(wrapper => wrapper.hasProp(prop, value))
  }

  hasStyle (style: string, value: string): boolean {
    return this.wrappers.every(wrapper => wrapper.hasStyle(style, value))
  }

  findAll (): void {
    if (this.wrappers.length === 0) {
      throw new Error('findAll cannot be called on 0 items')
    }

    throw new Error('findAll must be called on a single wrapper, use at(i) to access a wrapper')
  }

  find (selector: string | Component): Wrapper | VueWrapper {
    if (this.wrappers.length === 0) {
      throw new Error('find cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('find must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].find(selector)
  }

  html (): string {
    if (this.wrappers.length === 0) {
      throw new Error('html cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('html must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].html()
  }

  is (selector: string | Component): boolean {
    return this.wrappers.every(wrapper => wrapper.is(selector))
  }

  isEmpty (): boolean {
    return this.wrappers.every(wrapper => wrapper.isEmpty())
  }

  isVueInstance (): boolean {
    return this.wrappers.every(wrapper => wrapper.isVueInstance())
  }

  name (): string {
    if (this.wrappers.length === 0) {
      throw new Error('name cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('name must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].name()
  }

  text (): string {
    if (this.wrappers.length === 0) {
      throw new Error('text cannot be called on 0 items')
    }

    if (this.wrappers.length > 1) {
      throw new Error('text must be called on a single wrapper, use at(i) to access a wrapper')
    }

    return this.wrappers[0].text()
  }

  setData (data: Object): void {
    this.wrappers.forEach(wrapper => wrapper.setData(data))
  }

  setProps (props: Object): void {
    this.wrappers.forEach(wrapper => wrapper.setProps(props))
  }

  trigger (event: string): void {
    this.wrappers.forEach(wrapper => wrapper.trigger(event))
  }
}
