import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../../src/mount'

describe('hasAttribute', () => {
  it('returns true if every item contains attribute matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(`<span><div ${attribute}=${value}></div></span>`)
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div').hasAttribute(attribute, value)).to.equal(true)
  })

  it('returns false if every item does not contain attribute', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div').hasAttribute('attribute', 'value')).to.equal(false)
  })

  it('throws an error if attribute is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const message = 'wrapper.hasAttribute() must be passed attribute as a string'
    expect(() => wrapper.findAll('div').hasAttribute(undefined, 'value')).to.throw(Error, message)
  })

  it('throws an error if value is not a string', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mount(compiled)
    const message = 'wrapper.hasAttribute() must be passed value as a string'
    expect(() => wrapper.findAll('div').hasAttribute('attribute', undefined)).to.throw(Error, message)
  })
})
