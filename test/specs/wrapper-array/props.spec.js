import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import 'packages/test-utils/src'

describeWithShallowAndMount('props', mountingMethod => {
  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: props cannot be called on 0 items'
    expect(() =>
      mountingMethod(compiled)
        .findAll('p')
        .props('p')
    ).toThrow(message)
  })

  it('throws error when called on a WrapperArray', () => {
    const compiled = compileToFunctions('<div><div /></div>')
    const wrapper = mountingMethod(compiled)
    const message =
      '[vue-test-utils]: props must be called on a single wrapper, use at(i) to access a wrapper'
    const fn = () => wrapper.findAll('div').props()
    expect(fn).toThrow(message)
  })
})
