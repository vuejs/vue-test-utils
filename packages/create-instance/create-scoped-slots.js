// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from 'shared/util'
import { VUE_VERSION } from 'shared/consts'

function isDestructuringSlotScope(slotScope: string): boolean {
  return slotScope[0] === '{' && slotScope[slotScope.length - 1] === '}'
}

function getVueTemplateCompilerHelpers(
  _Vue: Component
): { [name: string]: Function } {
  // $FlowIgnore
  const vue = new _Vue()
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
  helpers.$set = vue._renderProxy.$set
  return helpers
}

function validateEnvironment(): void {
  if (VUE_VERSION < 2.1) {
    throwError(`the scopedSlots option is only supported in vue@2.1+.`)
  }
}

const slotScopeRe = /<[^>]+ slot-scope=\"(.+)\"/

// Hide warning about <template> disallowed as root element
function customWarn(msg) {
  if (msg.indexOf('Cannot use <template> as component root element') === -1) {
    console.error(msg)
  }
}

export default function createScopedSlots(
  scopedSlotsOption: ?{ [slotName: string]: string | Function },
  _Vue: Component
): {
  [slotName: string]: (props: Object) => VNode | Array<VNode>
} {
  const scopedSlots = {}
  if (!scopedSlotsOption) {
    return scopedSlots
  }
  validateEnvironment()
  const helpers = getVueTemplateCompilerHelpers(_Vue)
  for (const scopedSlotName in scopedSlotsOption) {
    const slot = scopedSlotsOption[scopedSlotName]
    const isFn = typeof slot === 'function'
    // Type check to silence flow (can't use isFn)
    const renderFn =
      typeof slot === 'function'
        ? slot
        : compileToFunctions(slot, { warn: customWarn }).render

    const hasSlotScopeAttr = !isFn && slot.match(slotScopeRe)
    const slotScope = hasSlotScopeAttr && hasSlotScopeAttr[1]
    scopedSlots[scopedSlotName] = function(props) {
      let res
      if (isFn) {
        res = renderFn.call({ ...helpers }, props)
      } else if (slotScope && !isDestructuringSlotScope(slotScope)) {
        res = renderFn.call({ ...helpers, [slotScope]: props })
      } else if (slotScope && isDestructuringSlotScope(slotScope)) {
        res = renderFn.call({ ...helpers, ...props })
      } else {
        res = renderFn.call({ ...helpers, props })
      }
      // res is Array if <template> is a root element
      return Array.isArray(res) ? res[0] : res
    }
  }
  return scopedSlots
}
