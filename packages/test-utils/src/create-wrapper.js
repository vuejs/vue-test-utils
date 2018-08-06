// @flow

import Vue from 'vue'
import Wrapper from './wrapper'
import VueWrapper from './vue-wrapper'

export default function createWrapper (
  node: VNode | Component,
  options: WrapperOptions = {}
): VueWrapper | Wrapper {
  const componentInstance = node.componentInstance
  if (componentInstance) {
    return new VueWrapper(componentInstance, options)
  }
  return node instanceof Vue
    ? new VueWrapper(node, options)
    : new Wrapper(node, options)
}
