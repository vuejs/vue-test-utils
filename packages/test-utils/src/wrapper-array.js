// @flow

import type Wrapper from './wrapper'
import type VueWrapper from './vue-wrapper'
import { throwError } from 'shared/util'

export default class WrapperArray implements BaseWrapper {
  +wrappers: Array<Wrapper | VueWrapper>
  +length: number

  constructor(wrappers: Array<Wrapper | VueWrapper>) {
    const length = wrappers.length
    // $FlowIgnore
    Object.defineProperty(this, 'wrappers', {
      get: () => wrappers,
      set: () => throwError('wrapperArray.wrappers is read-only')
    })
    // $FlowIgnore
    Object.defineProperty(this, 'length', {
      get: () => length,
      set: () => throwError('wrapperArray.length is read-only')
    })
  }

  at(index: number): Wrapper | VueWrapper {
    if (index > this.length - 1) {
      throwError(`no item exists at ${index}`)
    }
    return this.wrappers[index]
  }

  attributes(): void {
    this.throwErrorIfWrappersIsEmpty('attributes')

    throwError(
      `attributes must be called on a single wrapper, use ` +
        `at(i) to access a wrapper`
    )
  }

  classes(): void {
    this.throwErrorIfWrappersIsEmpty('classes')

    throwError(
      `classes must be called on a single wrapper, use ` +
        `at(i) to access a wrapper`
    )
  }

  contains(selector: Selector): boolean {
    this.throwErrorIfWrappersIsEmpty('contains')

    return this.wrappers.every(wrapper => wrapper.contains(selector))
  }

  exists(): boolean {
    return this.length > 0 && this.wrappers.every(wrapper => wrapper.exists())
  }

  filter(predicate: Function): WrapperArray {
    return new WrapperArray(this.wrappers.filter(predicate))
  }

  emitted(): void {
    this.throwErrorIfWrappersIsEmpty('emitted')

    throwError(
      `emitted must be called on a single wrapper, use ` +
        `at(i) to access a wrapper`
    )
  }

  emittedByOrder(): void {
    this.throwErrorIfWrappersIsEmpty('emittedByOrder')

    throwError(
      `emittedByOrder must be called on a single wrapper, ` +
        `use at(i) to access a wrapper`
    )
  }

  findAll(): void {
    this.throwErrorIfWrappersIsEmpty('findAll')

    throwError(
      `findAll must be called on a single wrapper, use ` +
        `at(i) to access a wrapper`
    )
  }

  find(): void {
    this.throwErrorIfWrappersIsEmpty('find')

    throwError(
      `find must be called on a single wrapper, use at(i) ` +
        `to access a wrapper`
    )
  }

  html(): void {
    this.throwErrorIfWrappersIsEmpty('html')

    throwError(
      `html must be called on a single wrapper, use at(i) ` +
        `to access a wrapper`
    )
  }

  is(selector: Selector): boolean {
    this.throwErrorIfWrappersIsEmpty('is')

    return this.wrappers.every(wrapper => wrapper.is(selector))
  }

  isEmpty(): boolean {
    this.throwErrorIfWrappersIsEmpty('isEmpty')

    return this.wrappers.every(wrapper => wrapper.isEmpty())
  }

  isVisible(): boolean {
    this.throwErrorIfWrappersIsEmpty('isVisible')

    return this.wrappers.every(wrapper => wrapper.isVisible())
  }

  isVueInstance(): boolean {
    this.throwErrorIfWrappersIsEmpty('isVueInstance')

    return this.wrappers.every(wrapper => wrapper.isVueInstance())
  }

  name(): void {
    this.throwErrorIfWrappersIsEmpty('name')

    throwError(
      `name must be called on a single wrapper, use at(i) ` +
        `to access a wrapper`
    )
  }

  props(): void {
    this.throwErrorIfWrappersIsEmpty('props')

    throwError(
      `props must be called on a single wrapper, use ` +
        `at(i) to access a wrapper`
    )
  }

  text(): void {
    this.throwErrorIfWrappersIsEmpty('text')

    throwError(
      `text must be called on a single wrapper, use at(i) ` +
        `to access a wrapper`
    )
  }

  throwErrorIfWrappersIsEmpty(method: string): void {
    if (this.wrappers.length === 0) {
      throwError(`${method} cannot be called on 0 items`)
    }
  }

  setData(data: Object): void {
    this.throwErrorIfWrappersIsEmpty('setData')

    this.wrappers.forEach(wrapper => wrapper.setData(data))
  }

  setMethods(props: Object): void {
    this.throwErrorIfWrappersIsEmpty('setMethods')

    this.wrappers.forEach(wrapper => wrapper.setMethods(props))
  }

  setProps(props: Object): void {
    this.throwErrorIfWrappersIsEmpty('setProps')

    this.wrappers.forEach(wrapper => wrapper.setProps(props))
  }

  setValue(value: any): void {
    this.throwErrorIfWrappersIsEmpty('setValue')

    this.wrappers.forEach(wrapper => wrapper.setValue(value))
  }

  setChecked(checked: boolean = true): void {
    this.throwErrorIfWrappersIsEmpty('setChecked')

    this.wrappers.forEach(wrapper => wrapper.setChecked(checked))
  }

  setSelected(): void {
    this.throwErrorIfWrappersIsEmpty('setSelected')

    throwError(
      `setSelected must be called on a single wrapper, ` +
        `use at(i) to access a wrapper`
    )
  }

  trigger(event: string, options: Object): void {
    this.throwErrorIfWrappersIsEmpty('trigger')

    this.wrappers.forEach(wrapper => wrapper.trigger(event, options))
  }

  destroy(): void {
    this.throwErrorIfWrappersIsEmpty('destroy')

    this.wrappers.forEach(wrapper => wrapper.destroy())
  }
}
