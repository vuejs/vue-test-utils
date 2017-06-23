import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('text', () => {
  it('throws error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    const message = 'text must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapper.findAll('div').text()).to.throw(Error, message)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = 'text cannot be called on 0 items'
    expect(() => mount(compiled).findAll('p').text('p')).to.throw(Error, message)
  })
})
