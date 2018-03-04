import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('attributes', (mountingMethod) => {
  it('returns true if wrapper contains attribute matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(`<div ${attribute}=${value}></div>`)
    const wrapper = mountingMethod(compiled)
    expect(wrapper.attributes()).to.eql({ attribute: value })
  })

  it('returns empty object if wrapper does not contain any attributes', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.attributes()).to.eql({})
  })

  it('returns empty object if wrapper element is null', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    wrapper.element = null
    expect(wrapper.attributes()).to.eql({})
  })
})
