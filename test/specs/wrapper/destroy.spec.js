import { describeWithShallowAndMount } from '~resources/utils'
import { config } from 'packages/test-utils/src'

describeWithShallowAndMount('destroy', mountingMethod => {
  let originalConsoleError

  beforeEach(() => {
    config.showDeprecationWarnings = true
    originalConsoleError = console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it('triggers beforeDestroy ', () => {
    const stub = jest.fn()
    mountingMethod({
      render: () => {},
      beforeDestroy() {
        stub()
      }
    }).destroy()
    expect(stub).toHaveBeenCalled()
  })

  it('triggers destroy ', () => {
    const stub = jest.fn()
    mountingMethod({
      render: () => {},
      destroyed() {
        stub()
      }
    }).destroy()
    expect(stub).toHaveBeenCalled()
  })

  it('removes element from document.body', () => {
    const wrapper = mountingMethod(
      { template: '<div />' },
      { attachToDocument: true }
    )
    expect(wrapper.vm.$el.parentNode).toEqual(document.body)
    wrapper.destroy()
    expect(wrapper.vm.$el.parentNode).toBeNull()
  })

  it('removes functional component element from document.body', () => {
    const wrapper = mountingMethod(
      {
        functional: true,
        render: h => {
          return h('div', {}, [])
        }
      },
      { attachToDocument: true }
    )
    expect(wrapper.element.parentNode).toEqual(document.body)
    wrapper.destroy()
    expect(wrapper.element.parentNode).toBeNull()
  })

  it('throws if component throws during destroy', () => {
    const TestComponent = {
      template: '<div :p="a" />',
      beforeDestroy() {
        throw new Error('error')
      },
      data: () => ({
        a: 1
      })
    }
    const wrapper = mountingMethod(TestComponent)
    expect(() => wrapper.destroy()).toThrow()
  })

  const StubComponent = { props: ['a'], template: '<div><p></p></div>' }

  ;[
    ['attributes'],
    ['classes'],
    ['isEmpty'],
    ['isVisible'],
    ['isVueInstance'],
    ['name'],
    ['overview'],
    ['props'],
    ['text'],
    ['html'],
    ['contains', ['p']],
    ['get', ['p']],
    ['find', ['p']],
    ['findComponent', [StubComponent]],
    ['findAll', [StubComponent]],
    ['findAllComponents', [StubComponent]],
    ['is', [StubComponent]],
    ['setProps', [{ a: 1 }]],
    ['setData', [{}]],
    ['setMethods', [{}]],
    ['trigger', ['test-event']]
  ].forEach(([method, args = []]) => {
    it(`displays warning when ${method} is called on destroyed wrapper`, () => {
      config.showDeprecationWarnings = false
      const wrapper = mountingMethod(StubComponent)
      wrapper.destroy()
      wrapper[method](...args)

      expect(console.error).toHaveBeenCalled()
    })
  })
  ;['emitted', 'emittedByOrder', 'exists'].forEach(method => {
    it(`does not display warning when ${method} is called on destroyed wrapper`, () => {
      config.showDeprecationWarnings = false
      const wrapper = mountingMethod(StubComponent)
      wrapper.destroy()
      wrapper[method]()

      expect(console.error).not.toHaveBeenCalled()
    })
  })
})
