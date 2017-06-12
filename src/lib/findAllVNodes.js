// @flow

export default function findAllVNodes (vnode: VNode, nodes: Array<VNode> = []): Array<VNode> {
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

