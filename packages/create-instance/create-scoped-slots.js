// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from 'shared/util'
import { VUE_VERSION } from 'shared/consts'

function isDestructuringSlotScope(slotScope: string): boolean {
  return /^{.*}$/.test(slotScope)
}

function getVueTemplateCompilerHelpers(_Vue: Component): {
  [name: string]: Function
} {
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

function isScopedSlot(slot) {
  if (typeof slot === 'function') return { match: null, slot }

  const slotScopeRe = /<[^>]+ slot-scope="(.+)"/
  const vSlotRe = /<template v-slot(?::.+)?="(.+)"/
  const shortVSlotRe = /<template #.*="(.+)"/

  const hasOldSlotScope = slot.match(slotScopeRe)
  const hasVSlotScopeAttr = slot.match(vSlotRe)
  const hasShortVSlotScopeAttr = slot.match(shortVSlotRe)

  if (hasOldSlotScope) {
    return { slot, match: hasOldSlotScope }
  } else if (hasVSlotScopeAttr || hasShortVSlotScopeAttr) {
    // Strip v-slot and #slot attributes from `template` tag. compileToFunctions leaves empty `template` tag otherwise.
    const sanitizedSlot = slot.replace(
      /(<template)([^>]+)(>.+<\/template>)/,
      '$1$3'
    )
    return {
      slot: sanitizedSlot,
      match: hasVSlotScopeAttr || hasShortVSlotScopeAttr
    }
  }
  // we have no matches, so we just return
  return {
    slot: slot,
    match: null
  }
}

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

    const scopedSlotMatches = isScopedSlot(slot)

    // Type check to silence flow (can't use isFn)
    const renderFn =
      typeof slot === 'function'
        ? slot
        : compileToFunctions(scopedSlotMatches.slot, { warn: customWarn })
            .render

    const slotScope = scopedSlotMatches.match && scopedSlotMatches.match[1]

    scopedSlots[scopedSlotName] = function (props) {
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
