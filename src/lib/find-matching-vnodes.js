// @flow

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

function nodeMatchesSelector (node: VNode, selector: string): boolean {
  return node.elm && node.elm.getAttribute && node.elm.matches(selector)
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
