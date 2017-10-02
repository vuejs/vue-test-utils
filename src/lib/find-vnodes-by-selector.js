// @flow

import { removeDuplicateNodes, findAllVNodes } from './vnode-utils'

function nodeMatchesSelector (node: VNode, selector: string): boolean {
  return node.elm && node.elm.getAttribute && node.elm.matches(selector)
}

export default function findVNodesBySelector (vNode: VNode, selector: string): Array<VNode> {
  const nodes = findAllVNodes(vNode)
  const filteredNodes = nodes.filter(node => nodeMatchesSelector(node, selector))
  return removeDuplicateNodes(filteredNodes)
}
