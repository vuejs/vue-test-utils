// @flow

import { compileToFunctions } from 'vue-template-compiler'

function createVNodes(vm: Component, slotValue: string, name): Array<VNode> {
  const el = compileToFunctions(
    `<div><template slot=${name}>${slotValue}</template></div>`
  )
  const _staticRenderFns = vm._renderProxy.$options.staticRenderFns
  const _staticTrees = vm._renderProxy._staticTrees
  vm._renderProxy._staticTrees = []
  vm._renderProxy.$options.staticRenderFns = el.staticRenderFns
  const vnode = el.render.call(vm._renderProxy, vm.$createElement)
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns
  vm._renderProxy._staticTrees = _staticTrees
  return vnode.children[0]
}

function createVNodesForSlot(
  vm: Component,
  slotValue: SlotValue,
  name: string
): VNode | Array<VNode> {
  if (typeof slotValue === 'string') {
    return createVNodes(vm, slotValue, name)
  }
  const vnode = vm.$createElement(slotValue)
  ;(vnode.data || (vnode.data = {})).slot = name
  return vnode
}

export function createSlotVNodes(
  vm: Component,
  slots: SlotsObject
): Array<VNode | Array<VNode>> {
  return Object.keys(slots).reduce((acc, key) => {
    const content = slots[key]
    if (Array.isArray(content)) {
      const nodes = content.map(slotDef =>
        createVNodesForSlot(vm, slotDef, key)
      )
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(vm, content, key))
  }, [])
}
