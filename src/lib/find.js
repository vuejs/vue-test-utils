// @flow

import findVnodes from './find-vnodes'
import findVueComponents from './find-vue-components'
import {
  COMPONENT_SELECTOR,
  NAME_SELECTOR
} from './consts'
import Vue from 'vue'

export default function find (
  vm: Component | null,
  vnode: VNode,
  selectorType: ?string,
  selector: Selector
): Array<VNode | Component> {
  if (selectorType === COMPONENT_SELECTOR || selectorType === NAME_SELECTOR) {
    const root = vm || vnode
    return findVueComponents(root, selectorType, selector)
  }

  if (vm && vm.$refs && selector.ref in vm.$refs && vm.$refs[selector.ref] instanceof Vue) {
    return [vm.$refs[selector.ref]]
  }

  return findVnodes(vnode, vm, selectorType, selector)
}
