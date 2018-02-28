import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'

describe('props', () => {
  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: props cannot be called on 0 items'
    expect(() => mount(compiled).findAll('p').props('p')).to.throw().with.property('message', message)
  })

  it('throws error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    const message = '[vue-test-utils]: props must be called on a single wrapper, use at(i) to access a wrapper'
    const fn = () => wrapper.findAll('div').props()
    expect(fn).to.throw().with.property('message', message)
  })
})
