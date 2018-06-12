// @flow

import { findVNodesByRef, findVNodesByDOMSelector } from './find-vnodes'
import findVueComponents from './find-vue-components'
import findDOMNodes from './find-dom-nodes'
import {
  COMPONENT_SELECTOR,
  NAME_SELECTOR,
  DOM_SELECTOR,
  REF_SELECTOR
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

  if (!vm && selectorType === REF_SELECTOR) {
    throwError('$ref selectors can only be used on Vue component wrappers')
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
    if (selectorType === REF_SELECTOR) {
      return findVNodesByRef(vnode, selector.ref)
    }

    if (selectorType === DOM_SELECTOR) {
      const nodes = findVNodesByDOMSelector(vnode, selector)
      if (nodes.length) return nodes
    }
  }

  return findDOMNodes(element, selector)
}
