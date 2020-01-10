import { describeWithShallowAndMount } from '~resources/utils'
import '@vue/test-utils'

describeWithShallowAndMount('contains', mountingMethod => {
  it('returns true if every Wrapper contains element', () => {
    const TestComponent = {
      template: '<span><div><p /></div><div><p /></div></span>'
    }
    const wrapper = mountingMethod(TestComponent)
    const divArr = wrapper.findAll('div')
    expect(divArr.contains('p')).to.equal(true)
  })

  it('returns false if any Wrapper does not contain element', () => {
    const TestComponent = { template: '<div><div></div><div><p /></div></div>' }
    const wrapper = mountingMethod(TestComponent)
    const divArr = wrapper.findAll('div')
    expect(divArr.contains('p')).to.equal(false)
  })

  it('throws error if wrapper array contains no items', () => {
    const TestComponent = { template: '<div />' }
    const message = '[vue-test-utils]: contains cannot be called on 0 items'
    expect(() =>
      mountingMethod(TestComponent)
        .findAll('p')
        .contains('p')
    )
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if selector is not a valid selector', () => {
    const TestComponent = { template: '<div><p></p></div>' }
    const wrapper = mountingMethod(TestComponent)
    const pArr = wrapper.findAll('p')
    const invalidSelectors = [
      undefined,
      null,
      NaN,
      0,
      2,
      true,
      false,
      () => {},
      {},
      { name: undefined },
      []
    ]
    invalidSelectors.forEach(invalidSelector => {
      const message =
        '[vue-test-utils]: wrapper.contains() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      expect(() => pArr.contains(invalidSelector))
        .to.throw()
        .with.property('message', message)
    })
  })
})
