// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { componentNeedsCompiling } from './validators'
import { throwError } from './util'

export function compileFromString(str: string) {
  if (!compileToFunctions) {
    throwError(
      `vueTemplateCompiler is undefined, you must pass ` +
        `precompiled components if vue-template-compiler is ` +
        `undefined`
    )
  }
  return compileToFunctions(str)
}

export function compileTemplate(component: Component): void {
  if (component.template) {
    Object.assign(component, compileToFunctions(component.template))
  }

  if (component.components) {
    Object.keys(component.components).forEach(c => {
      const cmp = component.components[c]
      if (!cmp.render) {
        compileTemplate(cmp)
      }
    })
  }

  if (component.extends) {
    compileTemplate(component.extends)
  }

  if (component.extendOptions && !component.options.render) {
    compileTemplate(component.options)
  }
}

export function compileTemplateForSlots(slots: Object): void {
  Object.keys(slots).forEach(key => {
    const slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]]
    slot.forEach(slotValue => {
      if (componentNeedsCompiling(slotValue)) {
        compileTemplate(slotValue)
      }
    })
  })
}
