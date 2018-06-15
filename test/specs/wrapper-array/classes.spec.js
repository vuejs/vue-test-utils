import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import '~vue/test-utils'

describeWithShallowAndMount('classes', mountingMethod => {
  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: classes cannot be called on 0 items'
    expect(() =>
      mountingMethod(compiled)
        .findAll('p')
        .classes('p')
    )
      .to.throw()
      .with.property('message', message)
  })

  it('throws error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mountingMethod(compiled)
    const message =
      '[vue-test-utils]: classes must be called on a single wrapper, use at(i) to access a wrapper'
    const fn = () => wrapper.findAll('div').classes()
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })
})
