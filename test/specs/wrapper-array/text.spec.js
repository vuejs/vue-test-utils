import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import 'packages/test-utils/src'

describeWithShallowAndMount('text', mountingMethod => {
  it('throws error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mountingMethod(compiled)
    const message =
      '[vue-test-utils]: text must be called on a single wrapper, use at(i) to access a wrapper'
    const fn = () => wrapper.findAll('div').text()
    expect(fn).toThrow(message)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: text cannot be called on 0 items'
    const fn = () => mountingMethod(compiled).findAll('p').text('p')
    expect(fn).toThrow(message)
  })
})
