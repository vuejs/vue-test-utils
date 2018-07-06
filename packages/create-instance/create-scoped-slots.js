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
  return helpers
}

function validateEnvironment (): void {
  if (window.navigator.userAgent.match(/PhantomJS/i)) {
    throwError(
      `the scopedSlots option does not support PhantomJS. ` +
        `Please use Puppeteer, or pass a component.`
    )
  }
  if (vueVersion < 2.5) {
    throwError(`the scopedSlots option is only supported in ` + `vue@2.5+.`)
  }
}

function validateTempldate (template: string): void {
  if (template.trim().substr(0, 9) === '<template') {
    throwError(
      `the scopedSlots option does not support a template ` +
        `tag as the root element.`
    )
  }
}

export default function createScopedSlots (
  scopedSlotsOption: ?{ [slotName: string]: string }
): { [slotName: string]: (props: Object) => VNode } {
  const scopedSlots = {}
  if (!scopedSlotsOption) {
    return scopedSlots
  }
  validateEnvironment()
  const helpers = getVueTemplateCompilerHelpers()
  for (const name in scopedSlotsOption) {
    const template = scopedSlotsOption[name]
    validateTempldate(template)
    const render = compileToFunctions(template).render
    const domParser = new window.DOMParser()
    const _document = domParser.parseFromString(template, 'text/html')
    const slotScope = _document.body.firstChild.getAttribute(
      'slot-scope'
    )
    const isDestructuring = isDestructuringSlotScope(slotScope)
    scopedSlots[name] = function (props) {
      if (isDestructuring) {
        return render.call({ ...helpers, ...props })
      } else {
        return render.call({ ...helpers, [slotScope]: props })
      }
    }
  }
  return scopedSlots
}
