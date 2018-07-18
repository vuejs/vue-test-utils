// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { checkCompileToFunctions } from './validators'

export function compileTemplate (component: Component): void {
  if (component.template) {
    checkCompileToFunctions()
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
