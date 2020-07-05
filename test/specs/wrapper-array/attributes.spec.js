import { describeWithShallowAndMount } from '~resources/utils'
import '@vue/test-utils'

describeWithShallowAndMount('attributes', mountingMethod => {
  it('throws error if wrapper array contains no items', () => {
    const TestComponent = {
      template: '<div />'
    }
    const message = '[vue-test-utils]: attributes cannot be called on 0 items'
    expect(() =>
      mountingMethod(TestComponent)
        .findAll('p')
        .attributes('p')
    ).toThrow(message)
  })

  it('throws error when called on a WrapperArray', () => {
    const TestComponent = {
      template: '<div><div /></div>'
    }
    const wrapper = mountingMethod(TestComponent)
    const message =
      '[vue-test-utils]: attributes must be called on a single wrapper, use at(i) to access a wrapper'
    const fn = () => wrapper.findAll('div').attributes()
    expect(fn).toThrow(message)
  })
})
