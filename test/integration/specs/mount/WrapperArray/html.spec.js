import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../../src/mount'

describe('html', () => {
  it('throws an error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    const message = 'html must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapper.findAll('div').html()).to.throw(Error, message)
  })
})
