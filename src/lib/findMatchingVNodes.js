// @flow

import { matchesSelector } from 'sizzle'

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

function nodeMatchesSelector (node: VNode, selector: string): boolean {
  return node.elm && node.elm.getAttribute && matchesSelector(node.elm, selector)
}

export default function findMatchingVNodes (vNode: VNode, selector: string): Array<VNode> {
  const nodes = findAllVNodes(vNode)
  const matchingNodes = nodes.filter(node => nodeMatchesSelector(node, selector))
  return removeDuplicateNodes(matchingNodes)
}

