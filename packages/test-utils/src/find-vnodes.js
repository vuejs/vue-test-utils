// @flow

function findAllVNodes (vnode: VNode, nodes: Array<VNode> = []): Array<VNode> {
  nodes.push(vnode)

  if (Array.isArray(vnode.children)) {
    vnode.children.forEach(childVNode => findAllVNodes(childVNode, nodes))
  }

  if (vnode.child) {
    findAllVNodes(vnode.child._vnode, nodes)
  }

  return nodes
}

function removeDuplicateNodes (vNodes: Array<VNode>): Array<VNode> {
  return vNodes.filter((vNode, index) => index === vNodes.findIndex(node => vNode.elm === node.elm))
}

export function findVNodesByRef (
  vNode: VNode,
  refName: string
): Array<VNode> {
  const nodes = findAllVNodes(vNode)
    .filter(node => node.data && node.data.ref === refName && !!vNode.context.$refs[node.data.ref])
  return removeDuplicateNodes(nodes)
}

export function elementMatchesSelector (element: any, selector: string) {
  return !!(element && element.getAttribute && element.matches(selector))
}

export function findVNodesByDOMSelector (
  vNode: VNode,
  selector: string
): Array<VNode> {
  const nodes = findAllVNodes(vNode).filter(node => elementMatchesSelector(node.elm, selector))
  return removeDuplicateNodes(nodes)
}
