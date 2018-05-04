// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from 'shared/util'
import { validateSlots } from './validate-slots'

function isSingleElement (slotValue: string): boolean {
  const _slotValue = slotValue.trim()
  if (_slotValue[0] !== '<' || _slotValue[_slotValue.length - 1] !== '>') {
    return false
  }
  const domParser = new window.DOMParser()
  const _document = domParser.parseFromString(slotValue, 'text/html')
  return _document.body.childElementCount === 1
}

function createVNodesFromText (vm: Component, slotValue: string) {
  const compiledResult = compileToFunctions(`<div>${slotValue}{{ }}</div>`)
  const _staticRenderFns = vm._renderProxy.$options.staticRenderFns
  vm._renderProxy.$options.staticRenderFns = compiledResult.staticRenderFns
  const elem = compiledResult.render.call(vm._renderProxy, vm.$createElement).children
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns
  return elem
}

function validateEnvironment (_window, compileToFunctions): void {
  if (!compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
  }
  if (typeof _window === 'undefined') {
    throwError('the slots string option does not support strings in server-test-uitls.')
  }
  if (_window.navigator.userAgent.match(/PhantomJS/i)) {
    throwError('the slots option does not support strings in PhantomJS. Please use Puppeteer, or pass a component.')
  }
}

function addSlotToVm (vm: Component, slotName: string, slotValue: Component | string | Array<Component> | Array<string>): void {
  let elem
  validateEnvironment(window, compileToFunctions)
  if (typeof slotValue === 'string') {
    if (isSingleElement(slotValue)) {
      elem = vm.$createElement(compileToFunctions(slotValue))
    } else {
      elem = createVNodesFromText(vm, slotValue)
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
  validateSlots(slots)
  Object.keys(slots).forEach((key) => {
    if (Array.isArray(slots[key])) {
      slots[key].forEach((slotValue) => {
        addSlotToVm(vm, key, slotValue)
      })
    } else {
      addSlotToVm(vm, key, slots[key])
    }
  })
}
