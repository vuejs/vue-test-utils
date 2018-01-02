import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue-test-utils'

describe('at', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const message = '[vue-test-utils]: at() must be called on a WrapperArray'
    const fn = () => wrapper.at()
    expect(fn).to.throw().with.property('message', message)
  })
})
