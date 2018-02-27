// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from './util'

function isValidSlot (slot: any): boolean {
  return true
}

function addSlotToVm (vm: Component, slotName: string, slotValue: Component | string | Array<Component> | Array<string>): void {
  let elem
  if (typeof slotValue === 'string') {
    if (!compileToFunctions) {
      throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
    }
    if (window.navigator.userAgent.match(/PhantomJS/i)) {
      throwError('option.slots does not support strings in PhantomJS. Please use Puppeteer, or pass a component')
    }
    const domParser = new window.DOMParser()
    const document = domParser.parseFromString(slotValue, 'text/html')
    const _slotValue = slotValue.trim()
    if (_slotValue[0] === '<' && _slotValue[_slotValue.length - 1] === '>' && document.body.childElementCount === 1) {
      elem = vm.$createElement(compileToFunctions(slotValue))
    } else {
      const compiledResult = compileToFunctions(`<div>${slotValue}{{ }}</div>`)
      const _staticRenderFns = vm._renderProxy.$options.staticRenderFns
      vm._renderProxy.$options.staticRenderFns = compiledResult.staticRenderFns
      elem = compiledResult.render.call(vm._renderProxy, vm.$createElement).children
      vm._renderProxy.$options.staticRenderFns = _staticRenderFns
    }
  } else {
    elem = vm.$createElement(slotValue)
  }
  if (Array.isArray(elem)) {
    if (Array.isArray(vm.$slots[slotName])) {
      vm.$slots[slotName] = [...vm.$slots[slotName], ...elem]
    } else {
      vm.$slots[slotName] = [...elem]
    }
  } else {
    if (Array.isArray(vm.$slots[slotName])) {
      vm.$slots[slotName].push(elem)
    } else {
      vm.$slots[slotName] = [elem]
    }
  }
}

export function addSlots (vm: Component, slots: Object): void {
  Object.keys(slots).forEach((key) => {
    if (!isValidSlot(slots[key])) {
      throwError('slots[key] must be a Component, string or an array of Components')
    }

    if (Array.isArray(slots[key])) {
      slots[key].forEach((slotValue) => {
        if (!isValidSlot(slotValue)) {
          throwError('slots[key] must be a Component, string or an array of Components')
        }
        addSlotToVm(vm, key, slotValue)
      })
    } else {
      addSlotToVm(vm, key, slots[key])
    }
  })
}
