// @flow

import { compileToFunctions } from 'vue-template-compiler'

export function compileTemplate (component: Component) {
  if (component.components) {
    Object.keys(component.components).forEach((c) => {
      const cmp = component.components[c]
      if (!cmp.render) {
        compileTemplate(cmp)
      }
    })
  }
  if (component.extends) {
    compileTemplate(component.extends)
  }
  if (component.template) {
    Object.assign(component, compileToFunctions(component.template))
  }
}
