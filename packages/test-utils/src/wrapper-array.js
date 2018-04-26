// @flow

import type Wrapper from './wrapper'
import type VueWrapper from './vue-wrapper'
import {
  throwError,
  warn
} from 'shared/util'

export default class WrapperArray extends Array<Wrapper> implements BaseWrapper {
  at (index: number): Wrapper | VueWrapper {
    if (index > this.length - 1) {
      throwError(`no item exists at ${index}`)
    }
    return this[index]
  }

  attributes (): void {
    this.throwErrorIfWrappersIsEmpty('attributes')

    throwError('attributes must be called on a single wrapper, use at(i) to access a wrapper')
  }

  classes (): void {
    this.throwErrorIfWrappersIsEmpty('classes')

    throwError('classes must be called on a single wrapper, use at(i) to access a wrapper')
  }

  contains (selector: Selector): boolean {
    this.throwErrorIfWrappersIsEmpty('contains')

    return this.every(wrapper => wrapper.contains(selector))
  }

  exists (): boolean {
    return this.length > 0 && this.every(wrapper => wrapper.exists())
  }

  visible (): boolean {
    this.throwErrorIfWrappersIsEmpty('visible')

    return this.length > 0 && this.every(wrapper => wrapper.visible())
  }

  emitted (): void {
    this.throwErrorIfWrappersIsEmpty('emitted')

    throwError('emitted must be called on a single wrapper, use at(i) to access a wrapper')
  }

  emittedByOrder (): void {
    this.throwErrorIfWrappersIsEmpty('emittedByOrder')

    throwError('emittedByOrder must be called on a single wrapper, use at(i) to access a wrapper')
  }

  hasAttribute (attribute: string, value: string): boolean {
    this.throwErrorIfWrappersIsEmpty('hasAttribute')

    return this.every(wrapper => wrapper.hasAttribute(attribute, value))
  }

  hasClass (className: string): boolean {
    this.throwErrorIfWrappersIsEmpty('hasClass')

    return this.every(wrapper => wrapper.hasClass(className))
  }

  hasProp (prop: string, value: string): boolean {
    this.throwErrorIfWrappersIsEmpty('hasProp')

    return this.every(wrapper => wrapper.hasProp(prop, value))
  }

  hasStyle (style: string, value: string): boolean {
    this.throwErrorIfWrappersIsEmpty('hasStyle')

    return this.every(wrapper => wrapper.hasStyle(style, value))
  }

  findAll (): void {
    this.throwErrorIfWrappersIsEmpty('findAll')

    throwError('findAll must be called on a single wrapper, use at(i) to access a wrapper')
  }

  find (): void {
    this.throwErrorIfWrappersIsEmpty('find')

    throwError('find must be called on a single wrapper, use at(i) to access a wrapper')
  }

  html (): void {
    this.throwErrorIfWrappersIsEmpty('html')

    throwError('html must be called on a single wrapper, use at(i) to access a wrapper')
  }

  is (selector: Selector): boolean {
    this.throwErrorIfWrappersIsEmpty('is')

    return this.every(wrapper => wrapper.is(selector))
  }

  isEmpty (): boolean {
    this.throwErrorIfWrappersIsEmpty('isEmpty')

    return this.every(wrapper => wrapper.isEmpty())
  }

  isVisible (): boolean {
    this.throwErrorIfWrappersIsEmpty('isVisible')

    return this.every(wrapper => wrapper.isVisible())
  }

  isVueInstance (): boolean {
    this.throwErrorIfWrappersIsEmpty('isVueInstance')

    return this.every(wrapper => wrapper.isVueInstance())
  }

  name (): void {
    this.throwErrorIfWrappersIsEmpty('name')

    throwError('name must be called on a single wrapper, use at(i) to access a wrapper')
  }

  props (): void {
    this.throwErrorIfWrappersIsEmpty('props')

    throwError('props must be called on a single wrapper, use at(i) to access a wrapper')
  }

  text (): void {
    this.throwErrorIfWrappersIsEmpty('text')

    throwError('text must be called on a single wrapper, use at(i) to access a wrapper')
  }

  throwErrorIfWrappersIsEmpty (method: string): void {
    if (this.length === 0) {
      throwError(`${method} cannot be called on 0 items`)
    }
  }

  setComputed (computed: Object): void {
    this.throwErrorIfWrappersIsEmpty('setComputed')

    this.forEach(wrapper => wrapper.setComputed(computed))
  }

  setData (data: Object): void {
    this.throwErrorIfWrappersIsEmpty('setData')

    this.forEach(wrapper => wrapper.setData(data))
  }

  setMethods (props: Object): void {
    this.throwErrorIfWrappersIsEmpty('setMethods')

    this.forEach(wrapper => wrapper.setMethods(props))
  }

  setProps (props: Object): void {
    this.throwErrorIfWrappersIsEmpty('setProps')

    this.forEach(wrapper => wrapper.setProps(props))
  }

  trigger (event: string, options: Object): void {
    this.throwErrorIfWrappersIsEmpty('trigger')

    this.forEach(wrapper => wrapper.trigger(event, options))
  }

  update (): void {
    this.throwErrorIfWrappersIsEmpty('update')
    warn('update has been removed. All changes are now synchrnous without calling update')
  }

  destroy (): void {
    this.throwErrorIfWrappersIsEmpty('destroy')

    this.forEach(wrapper => wrapper.destroy())
  }
}
