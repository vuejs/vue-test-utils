// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { validateSlots } from './validate-slots'
import { toArray } from 'shared/util'

function isSingleHTMLTag (template: string) {
  if (!template.startsWith('<') || !template.endsWith('>')) {
    return false
  }
  const _document = new window.DOMParser().parseFromString(template, 'text/html')
  return _document.body.childElementCount === 1
}

function createElementFromAdvancedString (slotValue, vm) {
  const compiledResult = compileToFunctions(`<div>${slotValue}{{ }}</div>`)
  const _staticRenderFns = vm._renderProxy.$options.staticRenderFns
  vm._renderProxy.$options.staticRenderFns = compiledResult.staticRenderFns
  const elem = compiledResult.render.call(vm._renderProxy, vm.$createElement).children
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns
  return elem
}

function createElement (slotValue: string | Object, vm) {
  if (typeof slotValue === 'string') {
    slotValue = slotValue.trim()
    if (isSingleHTMLTag(slotValue)) {
      return vm.$createElement(compileToFunctions(slotValue))
    } else {
      return createElementFromAdvancedString(slotValue, vm)
    }
  } else {
    return vm.$createElement(slotValue)
  }
}

export function addSlots (vm: Component, slots: Object): void {
  validateSlots(slots)
  Object.keys(slots).forEach(name => {
    vm.$slots[name] = toArray(slots[name])
      .map(slotValue => createElement(slotValue, vm))
  })
}
