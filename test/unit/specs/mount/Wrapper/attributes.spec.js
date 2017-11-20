import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('attributes', () => {
  it('returns true if wrapper contains attribute matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(`<div ${attribute}=${value}></div>`)
    const wrapper = mount(compiled)
    expect(wrapper.attributes()).to.eql({ attribute: value })
  })

  it('returns empty object if wrapper does not contain any attributes', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.attributes()).to.eql({})
  })

  it('returns empoty object if wrapper element is null', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    wrapper.element = null
    expect(wrapper.attributes()).to.eql({})
  })
})
