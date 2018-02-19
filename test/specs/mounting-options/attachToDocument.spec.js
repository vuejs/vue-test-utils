import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/test-utils'
import { renderToString } from '~vue-test-utils'

describeWithShallowAndMount('options.attachToDocument', (mountingMethod) => {
  it('returns VueWrapper with attachedToDocument set to true when passed attachToDocument in options', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mountingMethod(compiled, { attachToDocument: true })
    expect(wrapper.options.attachedToDocument).to.equal(true)
  })
})

describe('options.attachToDocument with renderToString', () => {
  it('throws error that renderToString does not accept attachToDocument', () => {
    // renderToString can only be run in node
    if (!(navigator.userAgent.includes && navigator.userAgent.includes('jsdom'))) {
      return
    }
    const compiled = compileToFunctions('<div><input /></div>')
    const fn = () => renderToString(compiled, { attachToDocument: true })
    const message = '[vue-test-utils]: you cannot use attachToDocument with renderToString'
    expect(fn).to.throw().with.property('message', message)
  })
})
