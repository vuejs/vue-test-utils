// @flow
import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from 'shared/util'
import Vue from 'vue'

function isDestructuringSlotScope (slotScope: string): boolean {
  return slotScope[0] === '{' && slotScope[slotScope.length - 1] === '}'
}

function getVueTemplateCompilerHelpers (proxy: Object): Object {
  const helpers = {}
  const names = ['_c', '_o', '_n', '_s', '_l', '_t', '_q', '_i', '_m', '_f', '_k', '_b', '_v', '_e', '_u', '_g']
  names.forEach((name) => {
    helpers[name] = proxy[name]
  })
  return helpers
}

export function addScopedSlots (vm: Component, scopedSlots: any) {
  if (window.navigator.userAgent.match(/PhantomJS/i)) {
    throwError('the scopedSlots option does not support PhantomJS. Please use Puppeteer, or pass a component.')
  }

  const vueVersion = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)
  if (vueVersion < 2.5) {
    throwError('the scopedSlots option is only supported in vue@2.5+.')
  }
  vm.$_vueTestUtils_scopedSlots = {}
  vm.$_vueTestUtils_slotScopes = {}
  const renderSlot = vm._renderProxy._t

  vm._renderProxy._t = function (name, feedback, props, bindObject) {
    const scopedSlotFn = vm.$_vueTestUtils_scopedSlots[name]
    const slotScope = vm.$_vueTestUtils_slotScopes[name]
    if (scopedSlotFn) {
      props = { ...bindObject, ...props }
      const helpers = getVueTemplateCompilerHelpers(vm._renderProxy)
      let proxy = { ...helpers }
      if (isDestructuringSlotScope(slotScope)) {
        proxy = { ...helpers, ...props }
      } else {
        proxy[slotScope] = props
      }
      return scopedSlotFn.call(proxy)
    } else {
      return renderSlot.call(vm._renderProxy, name, feedback, props, bindObject)
    }
  }

  Object.keys(scopedSlots).forEach((key) => {
    const template = scopedSlots[key].trim()
    if (template.substr(0, 9) === '<template') {
      throwError('the scopedSlots option does not support a template tag as the root element.')
    }
    const domParser = new window.DOMParser()
    const _document = domParser.parseFromString(template, 'text/html')
    vm.$_vueTestUtils_scopedSlots[key] = compileToFunctions(template).render
    vm.$_vueTestUtils_slotScopes[key] = _document.body.firstChild.getAttribute('slot-scope')
  })
}
