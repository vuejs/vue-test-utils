// @flow

import findDOMNodes from './find-dom-nodes'
import {
  DOM_SELECTOR,
  REF_SELECTOR
} from './consts'
import { throwError } from 'shared/util'
import { matches } from './matches'

export function findAllInstances (vm, instances = []) {
  instances.push(vm)

  ;(vm.$children || []).forEach(child => {
    findAllInstances(child, instances)
  })

  return instances
}

function findAllVNodes (
  vnode: VNode,
  nodes: Array<VNode> = [],
  selector: any
): Array<VNode> {
  if (matches(vnode, selector)) {
    nodes.push(vnode)
  }

  if (Array.isArray(vnode.children)) {
    vnode.children.forEach(v => {
      findAllVNodes(v, nodes, selector)
    })
  }
  if (vnode.componentInstance) {
    findAllVNodes(vnode.componentInstance._vnode, nodes, selector)
  }
  return nodes
}

function removeDuplicateNodes (vNodes: Array<VNode>): Array<VNode> {
  const vNodeElms = vNodes.map(vNode => vNode.elm)
  return vNodes.filter(
    (vNode, index) => index === vNodeElms.indexOf(vNode.elm)
  )
}

export default function findAll (
  root: VNode | Element,
  vm: Component,
  selector: Selector
): Array<VNode | Component> {
  if ((root instanceof Element) && selector.type !== DOM_SELECTOR) {
    throwError(
      `cannot find a Vue instance on a DOM node. The node ` +
      `you are calling find on does not exist in the ` +
      `VDom. Are you adding the node as innerHTML?`
    )
  }

  if (root instanceof Element) {
    return findDOMNodes(root, selector.value)
  }

  if (!root && selector.type !== DOM_SELECTOR) {
    throwError(
      `cannot find a Vue instance on a DOM node. The node ` +
      `you are calling find on does not exist in the ` +
      `VDom. Are you adding the node as innerHTML?`
    )
  }

  if (!vm && selector.type === REF_SELECTOR) {
    throwError(
      `$ref selectors can only be used on Vue component ` + `wrappers`
    )
  }

  if (
    vm &&
    vm.$refs &&
    selector.value.ref in vm.$refs
  ) {
    const refs = vm.$refs[selector.value.ref]
    return Array.isArray(refs) ? refs : [refs]
  }

  const nodes = findAllVNodes(root, [], selector)
  const dedupedNodes = removeDuplicateNodes(nodes)

  if (nodes.length > 0 || selector.type !== DOM_SELECTOR) {
    return dedupedNodes
  }
  return findDOMNodes(root.elm, selector.value)
}
