import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('hasAttribute', () => {
  it('returns true if wrapper contains attribute matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(`<div ${attribute}=${value}></div>`)
    const wrapper = mount(compiled)
    expect(wrapper.hasAttribute(attribute, value)).to.equal(true)
  })

  it('returns false if wrapper does not contain attribute', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.hasAttribute('attribute', 'value')).to.equal(false)
  })

  it('returns false if wrapper element is null', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    wrapper.element = null
    expect(wrapper.hasAttribute('attribute', 'value')).to.equal(false)
  })

  it('throws an error if attribute is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const message = '[vue-test-utils]: wrapper.hasAttribute() must be passed attribute as a string'
    const fn = () => wrapper.hasAttribute(undefined, 'value')
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws an error if value is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const message = '[vue-test-utils]: wrapper.hasAttribute() must be passed value as a string'
    const fn = () => wrapper.hasAttribute('attribute', undefined)
    expect(fn).to.throw().with.property('message', message)
  })
})
