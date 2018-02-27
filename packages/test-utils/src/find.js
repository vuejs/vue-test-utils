// @flow

import findVnodes from './find-vnodes'
import findVueComponents from './find-vue-components'
import findDOMNodes from './find-dom-nodes'
import {
  COMPONENT_SELECTOR,
  NAME_SELECTOR,
  DOM_SELECTOR
} from './consts'
import Vue from 'vue'
import getSelectorTypeOrThrow from './get-selector-type'
import { throwError } from 'shared/util'

export default function find (
  vm: Component | null,
  vnode: VNode | null,
  element: Element,
  selector: Selector
): Array<VNode | Component> {
  const selectorType = getSelectorTypeOrThrow(selector, 'find')

  if (!vnode && !vm && selectorType !== DOM_SELECTOR) {
    throwError('cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?')
  }

  if (selectorType === COMPONENT_SELECTOR || selectorType === NAME_SELECTOR) {
    const root = vm || vnode
    if (!root) {
      return []
    }
    return findVueComponents(root, selectorType, selector)
  }

  if (vm && vm.$refs && selector.ref in vm.$refs && vm.$refs[selector.ref] instanceof Vue) {
    return [vm.$refs[selector.ref]]
  }

  if (vnode) {
    const nodes = findVnodes(vnode, vm, selectorType, selector)
    if (selectorType !== DOM_SELECTOR) {
      return nodes
    }
    return nodes.length > 0 ? nodes : findDOMNodes(element, selector)
  }

  return findDOMNodes(element, selector)
}
