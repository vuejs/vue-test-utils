// @flow

import Vue from 'vue'
import Wrapper from './wrapper'
import VueWrapper from './vue-wrapper'

export default function createWrapper (
  node: VNode | Component,
  options: WrapperOptions
): VueWrapper | Wrapper {
  if (node.componentInstance) {
    return new VueWrapper(node.componentInstance, options)
  }
  return node instanceof Vue
    ? new VueWrapper(node, options)
    : new Wrapper(node, options)
}
