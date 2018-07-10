// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'

function startsWithTag (str: SlotValue): boolean {
  return typeof str === 'string' && str.trim()[0] === '<'
}

function createVNodesForSlot (
  h: Function,
  slotValue: SlotValue,
  name: string,
  _Vue: any
): VNode | string {
  if (typeof slotValue === 'string' && !startsWithTag(slotValue)) {
    return slotValue
  }

  const el =
    typeof slotValue === 'string' ? compileToFunctions(slotValue) : slotValue

  let vnode = h(el)
  if (typeof slotValue === 'string') {
    const vue = new Vue()
    const _vue = new _Vue()
    for (const key in _vue._renderProxy) {
      if (!(vue._renderProxy[key])) {
        vue._renderProxy[key] = _vue._renderProxy[key]
      }
    }
    try {
      // $FlowIgnore
      vnode = el.render.call(vue._renderProxy, h)
      vnode = h(vnode.tag, vnode.data || {}, vnode.children)
    } catch (e) {
    }
  }

  vnode.data.slot = name
  return vnode
}

export function createSlotVNodes (
  h: Function,
  slots: SlotsObject,
  _Vue: any
): Array<VNode | string> {
  return Object.keys(slots).reduce((acc, key) => {
    const content = slots[key]
    if (Array.isArray(content)) {
      const nodes = content.map(
        slotDef => createVNodesForSlot(h, slotDef, key, _Vue)
      )
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(h, content, key, _Vue))
  }, [])
}
