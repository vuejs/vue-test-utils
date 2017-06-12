// @flow

import { matchesSelector } from 'sizzle'
import findAllVNodes from './findAllVNodes'

function nodeMatchesSelector (node: VNode, selector: string): boolean {
  return node.elm && node.elm.getAttribute && matchesSelector(node.elm, selector)
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

export default function findMatchingVNodes (vNode: VNode, selector: string): Array<VNode> {
  const nodes = findAllVNodes(vNode)
  const filteredNodes = nodes.filter(node => nodeMatchesSelector(node, selector))
  return removeDuplicateNodes(filteredNodes)
}
