// @flow

import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { throwError, vueVersion } from 'shared/util'

function isDestructuringSlotScope (slotScope: string): boolean {
  return slotScope[0] === '{' && slotScope[slotScope.length - 1] === '}'
}

function getVueTemplateCompilerHelpers (): { [name: string]: Function } {
  const vue = new Vue()
  const helpers = {}
  const names = [
    '_c',
    '_o',
    '_n',
    '_s',
    '_l',
    '_t',
    '_q',
    '_i',
    '_m',
    '_f',
    '_k',
    '_b',
    '_v',
    '_e',
    '_u',
    '_g'
  ]
  names.forEach(name => {
    helpers[name] = vue._renderProxy[name]
  })
  helpers.$createElement = vue._renderProxy.$createElement
  return helpers
}

function validateEnvironment (): void {
  if (vueVersion < 2.1) {
    throwError(`the scopedSlots option is only supported in vue@2.1+.`)
  }
}

const slotScopeRe = /<[^>]+ slot-scope=\"(.+)\"/

export default function createScopedSlots (
  scopedSlotsOption: ?{ [slotName: string]: string | Function }
): {
  [slotName: string]: (props: Object) => VNode | Array<VNode>
} {
  const scopedSlots = {}
  if (!scopedSlotsOption) {
    return scopedSlots
  }
  validateEnvironment()
  const helpers = getVueTemplateCompilerHelpers()
  for (const s in scopedSlotsOption) {
    const slot = scopedSlotsOption[s]
    const isFn = typeof slot === 'function'
    // Type check in render function to silence flow
    const renderFn = typeof slot === 'function'
      ? slot
      : compileToFunctions(slot).render

    const hasSlotScopeAttr = !isFn && slot.match(slotScopeRe)
    const slotScope = hasSlotScopeAttr && hasSlotScopeAttr[1]
    scopedSlots[s] = function (props) {
      if (isFn) {
        return renderFn.call({ ...helpers }, props)
      } else if (slotScope && !isDestructuringSlotScope(slotScope)) {
        return renderFn.call({ ...helpers, [slotScope]: props })
      } else {
        return renderFn.call({ ...helpers, ...props })
      }
    }
  }
  return scopedSlots
}
