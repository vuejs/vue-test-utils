// @flow

import {
  REF_SELECTOR
} from './consts'
import {
  throwError
} from 'shared/util'

function findAllVNodes (vnode: VNode, nodes: Array<VNode> = []): Array<VNode> {
  nodes.push(vnode)

  if (Array.isArray(vnode.children)) {
    vnode.children.forEach((childVNode) => {
      findAllVNodes(childVNode, nodes)
    })
  }

  if (vnode.child) {
    findAllVNodes(vnode.child._vnode, nodes)
  }

  return nodes
}

function removeDuplicateNodes (vNodes: Array<VNode>): Array<VNode> {
  const uniqueNodes = []
  vNodes.forEach((vNode) => {
    const exists = uniqueNodes.some(node => vNode.elm === node.elm)
    if (!exists) {
      uniqueNodes.push(vNode)
    }
  })
  return uniqueNodes
}

function nodeMatchesRef (node: VNode, refName: string): boolean {
  return node.data && node.data.ref === refName
}

function findVNodesByRef (vNode: VNode, refName: string): Array<VNode> {
  const nodes = findAllVNodes(vNode)
  const refFilteredNodes = nodes.filter(node => nodeMatchesRef(node, refName))
  // Only return refs defined on top-level VNode to provide the same
  // behavior as selecting via vm.$ref.{someRefName}
  const mainVNodeFilteredNodes = refFilteredNodes.filter(node => (
    !!vNode.context.$refs[node.data.ref]
  ))
  return removeDuplicateNodes(mainVNodeFilteredNodes)
}

function nodeMatchesSelector (node: VNode, selector: string): boolean {
  return node.elm && node.elm.getAttribute && node.elm.matches(selector)
}

function findVNodesBySelector (
  vNode: VNode,
  selector: string
): Array<VNode> {
  const nodes = findAllVNodes(vNode)
  const filteredNodes = nodes.filter(node => (
    nodeMatchesSelector(node, selector)
  ))
  return removeDuplicateNodes(filteredNodes)
}

export default function findVnodes (
  vnode: VNode,
  vm: Component | null,
  selectorType: ?string,
  selector: Object | string
): Array<VNode> {
  if (selectorType === REF_SELECTOR) {
    if (!vm) {
      throwError('$ref selectors can only be used on Vue component wrappers')
    }
    // $FlowIgnore
    return findVNodesByRef(vnode, selector.ref)
  }
  // $FlowIgnore
  return findVNodesBySelector(vnode, selector)
}
