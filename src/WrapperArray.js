// @flow

import type Wrapper from './Wrapper'
import type VueWrapper from './VueWrapper'

export default class WrapperArray implements BaseWrapper {
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

  find (): void {
    if (this.wrappers.length === 0) {
      throw new Error('find cannot be called on 0 items')
    }

    throw new Error('find must be called on a single wrapper, use at(i) to access a wrapper')
  }

  html (): void {
    if (this.wrappers.length === 0) {
      throw new Error('html cannot be called on 0 items')
    }

    throw new Error('html must be called on a single wrapper, use at(i) to access a wrapper')
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

  name (): void {
    if (this.wrappers.length === 0) {
      throw new Error('name cannot be called on 0 items')
    }

    throw new Error('name must be called on a single wrapper, use at(i) to access a wrapper')
  }

  text (): void {
    if (this.wrappers.length === 0) {
      throw new Error('text cannot be called on 0 items')
    }

    throw new Error('text must be called on a single wrapper, use at(i) to access a wrapper')
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

  update (): void {
    this.wrappers.forEach(wrapper => wrapper.update())
  }
}
