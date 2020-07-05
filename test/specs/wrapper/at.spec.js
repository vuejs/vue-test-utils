import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('at', mountingMethod => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    const message = '[vue-test-utils]: at() must be called on a WrapperArray'
    const fn = () => wrapper.at()
    expect(fn).toThrow(message)
  })
})
