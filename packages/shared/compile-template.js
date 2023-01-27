// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { componentNeedsCompiling } from './validators'
import { throwError, keys } from './util'

export function compileTemplate(component: Component): void {
  if (component.template) {
    if (!compileToFunctions) {
      throwError(
        `vueTemplateCompiler is undefined, you must pass ` +
          `precompiled components if vue-template-compiler is ` +
          `undefined`
      )
    }

    if (component.template.charAt('#') === '#') {
      var el = document.querySelector(component.template)
      if (!el) {
        throwError('Cannot find element' + component.template)

        el = document.createElement('div')
      }
      component.template = el.innerHTML
    }

    Object.assign(component, {
      ...compileToFunctions(component.template),
      name: component.name
    })
  }

  if (component.components) {
    keys(component.components).forEach(c => {
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
  keys(slots).forEach(key => {
    const slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]]
    slot.forEach(slotValue => {
      if (componentNeedsCompiling(slotValue)) {
        compileTemplate(slotValue)
      }
    })
  })
}
