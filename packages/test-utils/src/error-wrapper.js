// @flow

import { throwError } from 'shared/util'
import { REF_SELECTOR } from 'shared/consts'
import { getSelectorType } from './get-selector'

const buildSelectorString = (selector: Selector) => {
  if (getSelectorType(selector) === REF_SELECTOR) {
    return `ref="${selector.value.ref}"`
  }

  if (typeof selector === 'string') {
    return selector
  }

  return 'Component'
}

export default class ErrorWrapper implements BaseWrapper {
  selector: Selector
  selectorString: string

  constructor(selector: Selector) {
    this.selector = selector
    this.selectorString = buildSelectorString(selector)
  }

  at(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call at() on empty Wrapper`
    )
  }

  attributes(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call attributes() on empty Wrapper`

    )
  }

  classes(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call classes() on empty Wrapper`

    )
  }

  contains(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call contains() on empty Wrapper`
    )
  }

  emitted(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call emitted() on empty Wrapper`
    )
  }

  emittedByOrder(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call emittedByOrder() on empty Wrapper`
    )
  }

  exists(): boolean {
    return false
  }

  filter(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call filter() on empty Wrapper`
    )
  }

  visible(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call visible() on empty Wrapper`
    )
  }

  hasAttribute(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call hasAttribute() on empty Wrapper`
    )
  }

  hasClass(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call hasClass() on empty Wrapper`
    )
  }

  hasProp(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call hasProp() on empty Wrapper`
    )
  }

  hasStyle(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call hasStyle() on empty Wrapper`
    )
  }

  findAll(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call findAll() on empty Wrapper`
    )
  }

  find(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call find() on empty Wrapper`
    )
  }

  html(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call html() on empty Wrapper`
    )
  }

  is(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call is() on empty Wrapper`
    )
  }

  isEmpty(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call isEmpty() on empty Wrapper`
    )
  }

  isVisible(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call isVisible() on empty Wrapper`
    )
  }

  isVueInstance(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call isVueInstance() on empty Wrapper`
    )
  }

  name(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call name() on empty Wrapper`
    )
  }

  props(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call props() on empty Wrapper`
    )
  }

  text(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call text() on empty Wrapper`
    )
  }

  setComputed(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call setComputed() on empty Wrapper`
    )
  }

  setData(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call setData() on empty Wrapper`
    )
  }

  setMethods(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call setMethods() on empty Wrapper`
    )
  }

  setProps(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call setProps() on empty Wrapper`
    )
  }

  setValue(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call setValue() on empty Wrapper`
    )
  }

  setChecked(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call setChecked() on empty Wrapper`
    )
  }

  setSelected(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call setSelected() on empty Wrapper`
    )
  }

  trigger(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call trigger() on empty Wrapper`
    )
  }

  destroy(): void {
    throwError(
      `find did not return ${
        this.selectorString
      }, cannot call destroy() on empty Wrapper`
    )
  }
}
