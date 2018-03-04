import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('filter', (mountingMethod) => {
  it('throws an error', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    const message = '[vue-test-utils]: filter() must be called on a WrapperArray'
    const fn = () => wrapper.filter()
    expect(fn).to.throw().with.property('message', message)
  })
})
