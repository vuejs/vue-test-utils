import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('findAll', () => {
  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = 'findAll cannot be called on 0 items'
    expect(() => mount(compiled).findAll('p').findAll('p')).to.throw(Error, message)
  })

  it('throws an error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div></div><div><p /></div></div>')
    const wrapper = mount(compiled)
    const message = 'findAll must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapper.findAll('div').findAll('div')).to.throw(Error, message)
  })
})
