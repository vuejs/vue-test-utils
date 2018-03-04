// @flow

import Vue from 'vue'
import Wrapper from './wrapper'
import VueWrapper from './vue-wrapper'

export default function createWrapper (
  node: VNode | Component,
  update: Function,
  options: WrapperOptions
) {
  return node instanceof Vue
    ? new VueWrapper(node, options)
    : new Wrapper(node, update, options)
}
