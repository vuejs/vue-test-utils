import { renderToString } from '~vue/server-test-utils'
import Component from '~resources/components/component.vue'
import { isRunningJSDOM } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describe.skip('renderToString', () => {
  itDoNotRunIf(isRunningJSDOM,
    'throws error when not run in node', () => {
      const fn = () => renderToString(Component)
      const message = '[vue-test-utils]: renderToString must be run in node. It cannot be run in a browser'
      expect(fn).to.throw().with.property('message', message)
    })
})
