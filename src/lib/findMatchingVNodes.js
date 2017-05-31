import { matchesSelector } from 'sizzle'

function findAllVNodes (vNode, nodes = []) {
  nodes.push(vNode)

  if (Array.isArray(vNode.children)) {
    vNode.children.forEach((childVNode) => {
      findAllVNodes(childVNode, nodes)
    })
  }

  if (vNode.child) {
    findAllVNodes(vNode.child._vnode, nodes)
  }

  return nodes
}

function removeDuplicateNodes (vNodes) {
  const uniqueNodes = []
  vNodes.forEach((vNode) => {
    const exists = uniqueNodes.some(node => vNode.elm === node.elm)
    if (!exists) {
      uniqueNodes.push(vNode)
    }
  })
  return uniqueNodes
}

function nodeMatchesSelector (node, selector) {
  return node.elm && node.elm.getAttribute && matchesSelector(node.elm, selector)
}

export default function findMatchingVNodes (vNode, selector) {
  const nodes = findAllVNodes(vNode)
  const matchingNodes = nodes.filter(node => nodeMatchesSelector(node, selector))
  return removeDuplicateNodes(matchingNodes)
}

