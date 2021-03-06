import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('attributes', mountingMethod => {
  it('returns true if wrapper contains attribute matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(`<div ${attribute}=${value}></div>`)
    const wrapper = mountingMethod(compiled)
    expect(wrapper.attributes()).toEqual({ attribute: value })
  })

  it('returns empty object if wrapper does not contain any attributes', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.attributes()).toEqual({})
  })

  it('returns the given attribute if wrapper contains attribute matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(`<div ${attribute}=${value}></div>`)
    const wrapper = mountingMethod(compiled)
    expect(wrapper.attributes('attribute')).toEqual(value)
  })

  it('returns undefined if the wrapper does not contain the matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(`<div ${attribute}=${value}></div>`)
    const wrapper = mountingMethod(compiled)
    expect(wrapper.attributes('fake')).toEqual(undefined)
  })
})
