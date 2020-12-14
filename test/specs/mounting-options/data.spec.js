import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('options.data', mountingMethod => {
  const TestComponent = {
    data: () => ({ foo: 1, bar: 2 }),
    template: '<div />'
  }

  it('correctly merges component data and data passed to mount', () => {
    const wrapper = mountingMethod(TestComponent, { data: () => ({ foo: 3 }) })

    expect(wrapper.vm.foo).toBe(3)
    expect(wrapper.vm.bar).toBe(2)
  })

  it('does not fail when data is extracted to local variable', () => {
    const defaultData = { foo: 3 }

    const wrapper = mountingMethod(TestComponent, { data: () => defaultData })

    expect(wrapper.vm.foo).toBe(3)
    expect(wrapper.vm.bar).toBe(2)
  })
})
