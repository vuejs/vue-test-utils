// @flow

import { compileToFunctions } from 'vue-template-compiler'

function createVNodes (
  vm: Component,
  slotValue: string
): Array<VNode> {
  const el = compileToFunctions(`<div>${slotValue}</div>`)
  const _staticRenderFns = vm._renderProxy.$options.staticRenderFns
  const _staticTrees = vm._renderProxy._staticTrees
  vm._renderProxy._staticTrees = []
  vm._renderProxy.$options.staticRenderFns = el.staticRenderFns
  const vnode = el.render.call(vm._renderProxy, vm.$createElement)
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns
  vm._renderProxy._staticTrees = _staticTrees
  return vnode.children
}

function createVNodesForSlot (
  vm: Component,
  slotValue: SlotValue,
  name: string,
): VNode | Array<VNode> {
  let vnode
  if (typeof slotValue === 'string') {
    const vnodes = createVNodes(vm, slotValue)
    if (vnodes.length > 1) {
      return vnodes
    }
    vnode = vnodes[0]
  } else {
    vnode = vm.$createElement(slotValue)
  }
  if (vnode.data) {
    vnode.data.slot = name
  } else {
    vnode.data = { slot: name }
  }
  return vnode
}

export function createSlotVNodes (
  vm: Component,
  slots: SlotsObject
): Array<VNode | Array<VNode>> {
  return Object.keys(slots).reduce((acc, key) => {
    const content = slots[key]
    if (Array.isArray(content)) {
      const nodes = content.map(
        slotDef => createVNodesForSlot(vm, slotDef, key)
      )
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(vm, content, key))
  }, [])
}
