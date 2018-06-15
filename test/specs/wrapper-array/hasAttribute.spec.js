import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import '~vue/test-utils'

describeWithShallowAndMount('hasAttribute', mountingMethod => {
  it('returns true if every item contains attribute matching value', () => {
    const attribute = 'attribute'
    const value = 'value'
    const compiled = compileToFunctions(
      `<span><div ${attribute}=${value}></div></span>`
    )
    const wrapper = mountingMethod(compiled)
    expect(wrapper.findAll('div').hasAttribute(attribute, value)).to.equal(
      true
    )
  })

  it('returns false if every item does not contain attribute', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.findAll('div').hasAttribute('attribute', 'value')).to.equal(
      false
    )
  })

  it('throws an error if attribute is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    const message =
      '[vue-test-utils]: wrapper.hasAttribute() must be passed attribute as a string'
    const fn = () => wrapper.findAll('div').hasAttribute(undefined, 'value')
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message =
      '[vue-test-utils]: hasAttribute cannot be called on 0 items'
    const fn = () =>
      mountingMethod(compiled)
        .findAll('p')
        .hasAttribute('p')
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws an error if value is not a string', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mountingMethod(compiled)
    const message =
      '[vue-test-utils]: wrapper.hasAttribute() must be passed value as a string'
    const fn = () =>
      wrapper.findAll('div').hasAttribute('attribute', undefined)
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })
})
