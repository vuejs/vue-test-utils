import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'

describe('at', () => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const message = 'at() must be called on a WrapperArray'
    expect(() => wrapper.at()).to.throw(Error, message)
  })
})
