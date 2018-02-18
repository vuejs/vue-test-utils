import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/test-utils'
import { render } from '~vue-test-utils'

describeWithShallowAndMount('options.attachToDocument', (mountingMethod) => {
  it('returns VueWrapper with attachedToDocument set to true when passed attachToDocument in options', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mountingMethod(compiled, { attachToDocument: true })
    expect(wrapper.options.attachedToDocument).to.equal(true)
  })
})

describe('options.attachToDocument with render', () => {
  it('throws error that render does not accept attachToDocument', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const fn = () => render(compiled, { attachToDocument: true })
    const message = '[vue-test-utils]: you cannot use attachToDocument with render'
    expect(fn).to.throw().with.property('message', message)
  })
})
