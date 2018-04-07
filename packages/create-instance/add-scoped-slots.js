// @flow

import { compileToFunctions } from 'vue-template-compiler'
import { throwError } from 'shared/util'

export function addScopedSlots (vm: Component, scopedSlots: Object): void {
  Object.keys(scopedSlots).forEach((key) => {
    const template = scopedSlots[key].trim()
    if (template.substr(0, 9) === '<template') {
      throwError('the scopedSlots option does not support a template tag as the root element.')
    }
    vm.$_vueTestUtils_scopedSlots[key] = compileToFunctions(template).render
  })
}
