// @flow

import { removeDuplicateNodes, findAllVNodes } from './vnode-utils'

function nodeMatchesRef (node: VNode, refName: string): boolean {
  return node.data && node.data.ref === refName
}

export default function findVNodesByRef (vNode: VNode, refName: string): Array<VNode> {
  const nodes = findAllVNodes(vNode)
  const refFilteredNodes = nodes.filter(node => nodeMatchesRef(node, refName))
  // Only return refs defined on top-level VNode to provide the same behavior as selecting via vm.$ref.{someRefName}
  const mainVNodeFilteredNodes = refFilteredNodes.filter(node => !!vNode.context.$refs[node.data.ref])
  return removeDuplicateNodes(mainVNodeFilteredNodes)
}
