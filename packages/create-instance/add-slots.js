// @flow

import { compileToFunctions } from 'vue-template-compiler'

function startsWithTag (str: SlotValue): boolean {
  return typeof str === 'string' && str.trim()[0] === '<'
}

function createVNodesForSlot (
  h: Function,
  slotValue: SlotValue,
  name: string
): VNode | string {
  if (typeof slotValue === 'string' && !startsWithTag(slotValue)) {
    return slotValue
  }

  const el =
    typeof slotValue === 'string' ? compileToFunctions(slotValue) : slotValue

  const vnode = h(el)
  vnode.data.slot = name
  return vnode
}

export function createSlotVNodes (
  h: Function,
  slots: SlotsObject
): Array<VNode | string> {
  return Object.keys(slots).reduce((acc, key) => {
    const content = slots[key]
    if (Array.isArray(content)) {
      const nodes = content.map(slotDef => createVNodesForSlot(h, slotDef, key))
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(h, content, key))
  }, [])
}
