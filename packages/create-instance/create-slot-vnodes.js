// @flow

import { compileToFunctions } from 'vue-template-compiler'

function createVNodesForSlot (
  h: Function,
  slotValue: SlotValue,
  name: string,
  vm: Component
): VNode | string {
  let vnode
  if (typeof slotValue === 'string') {
    const el = compileToFunctions(`<div>${slotValue}{{ }}</div>`)
    const _staticRenderFns = vm._renderProxy.$options.staticRenderFns
    // version < 2.5
    if (!vm._renderProxy._staticTrees) {
      vm._renderProxy._staticTrees = []
    }
    vm._renderProxy.$options.staticRenderFns = el.staticRenderFns
    vnode = el.render.call(vm._renderProxy, h)
    vm._renderProxy.$options.staticRenderFns = _staticRenderFns
    vnode = vnode.children[0]
  } else {
    vnode = h(slotValue)
  }
  if (vnode.data) {
    vnode.data.slot = name
  } else {
    vnode.data = { slot: name }
  }
  return vnode
}

export function createSlotVNodes (
  h: Function,
  slots: SlotsObject,
  vm: Component
): Array<VNode | string> {
  return Object.keys(slots).reduce((acc, key) => {
    const content = slots[key]
    if (Array.isArray(content)) {
      const nodes = content.map(
        slotDef => createVNodesForSlot(h, slotDef, key, vm)
      )
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(h, content, key, vm))
  }, [])
}
