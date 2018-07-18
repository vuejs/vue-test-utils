// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'

const _renderSlot = Vue.prototype._t

function createVNodes (
  vm: Component,
  slotValue: Component | string
): ?Array<VNode> {
  if (typeof slotValue === 'string') {
    // Since compileToFunctions is checked in createSlotVNodes(),
    // it is not necessary to check compileToFunctions.
    const compiledResult = compileToFunctions(`<div>${slotValue}</div>`)
    const _staticRenderFns = vm._renderProxy.$options.staticRenderFns
    vm._renderProxy.$options.staticRenderFns = compiledResult.staticRenderFns
    const vnodes = compiledResult.render.call(
      vm._renderProxy, vm.$createElement
    ).children
    vm._renderProxy.$options.staticRenderFns = _staticRenderFns
    return vnodes
  }
  return [vm.$createElement(slotValue)]
}

export default function createRenderSlot (
  options: Object
): (
  name: string,
  fallback: ?Array<VNode>,
  props: ?Object,
  bindObject: ?Object
) => ?Array<VNode> {
  return function renderSlot (
    name: string,
    fallback: ?Array<VNode>,
    props: ?Object,
    bindObject: ?Object
  ): ?Array<VNode> {
    if (options.slots && options.slots[name]) {
      this.$slots[name] = []
      const slotsValue = options.slots[name]
      if (Array.isArray(slotsValue)) {
        slotsValue.forEach((value) => {
          if (typeof value === 'string') {
            const vnodes = createVNodes(this, value)
            if (Array.isArray(vnodes)) {
              this.$slots[name].push(...vnodes)
            }
          } else {
            this.$slots[name].push(this.$createElement(value))
          }
        })
      } else {
        const vnodes = createVNodes(this, slotsValue)
        if (Array.isArray(vnodes)) {
          this.$slots[name] = vnodes
        }
      }
    }
    return _renderSlot.call(this, name, fallback, props, bindObject)
  }
}
