import { describeWithShallowAndMount } from '~resources/utils'
import '@vue/test-utils'

describeWithShallowAndMount('find', mountingMethod => {
  it('throws error if wrapper array contains no items', () => {
    const TestComponent = {
      template: '<div />'
    }
    const message = '[vue-test-utils]: find cannot be called on 0 items'
    expect(() =>
      mountingMethod(TestComponent)
        .findAll('p')
        .find('p')
    ).toThrow(message)
  })

  it('throws an error when called on a WrapperArray', () => {
    const TestComponent = {
      template: '<div><div></div><div><p /></div></div>'
    }
    const wrapper = mountingMethod(TestComponent)
    const message =
      '[vue-test-utils]: find must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapper.findAll('div').find('div')).toThrow(message)
  })
})
