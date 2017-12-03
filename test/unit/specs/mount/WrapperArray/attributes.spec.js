import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('attributes', () => {
  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: attributes cannot be called on 0 items'
    expect(() => mount(compiled).findAll('p').attributes('p')).to.throw().with.property('message', message)
  })

  it('throws error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    const message = '[vue-test-utils]: attributes must be called on a single wrapper, use at(i) to access a wrapper'
    const fn = () => wrapper.findAll('div').attributes()
    expect(fn).to.throw().with.property('message', message)
  })
})
