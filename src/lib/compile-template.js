// @flow

import { compileToFunctions } from 'vue-template-compiler'

export function compileTemplate (component: Component) {
  Object.assign(component, compileToFunctions(component.template))
}
