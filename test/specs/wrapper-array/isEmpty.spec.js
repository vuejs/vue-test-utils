import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'

describe('isEmpty', () => {
  it('returns true if node is empty', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mount(compiled)

    expect(wrapper.findAll('p').isEmpty()).to.equal(true)
  })

  it('returns false if node contains other nodes', () => {
    const compiled = compileToFunctions('<div><span><p><p/></span></div>')
    const wrapper = mount(compiled)

    expect(wrapper.findAll('span').isEmpty()).to.equal(false)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: isEmpty cannot be called on 0 items'
    const fn = () => mount(compiled).findAll('p').isEmpty('p')
    expect(fn).to.throw().with.property('message', message)
  })
})
