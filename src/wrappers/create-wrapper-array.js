// @flow

import WrapperArray from './wrapper-array'
import type Wrapper from './wrapper'
import type VueWrapper from './vue-wrapper'

export default function createWrapperArray (wrappers: Array<Wrapper | VueWrapper>) {
  return new WrapperArray(wrappers)
}
