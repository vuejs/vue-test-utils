// @flow

import { compileToFunctions } from 'vue-template-compiler'

export function compileTemplate (component: Component) {
  if (component.extends) {
    compileTemplate(component.extends)
  }
  if (component.template) {
    Object.assign(component, compileToFunctions(component.template))
  }
}
