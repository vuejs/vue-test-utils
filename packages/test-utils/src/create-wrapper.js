// @flow

import Vue from 'vue'
import Wrapper from './wrapper'
import VueWrapper from './vue-wrapper'
import { trackInstance } from './auto-destroy'

export default function createWrapper(
  node: VNode | Component,
  options: WrapperOptions = {}
): VueWrapper | Wrapper {
  const componentInstance = node.child
  if (componentInstance) {
    const wrapper = new VueWrapper(componentInstance, options)
    trackInstance(wrapper)
    return wrapper
  }
  const wrapper =
    node instanceof Vue
      ? new VueWrapper(node, options)
      : new Wrapper(node, options)
  trackInstance(wrapper)
  return wrapper
}
