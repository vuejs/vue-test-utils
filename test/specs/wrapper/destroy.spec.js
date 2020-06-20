import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('destroy', mountingMethod => {
  const sandbox = sinon.createSandbox()

  afterEach(() => {
    sandbox.reset()
    sandbox.restore()
  })

  it('triggers beforeDestroy ', () => {
    const stub = sandbox.stub()
    mountingMethod({
      render: () => {},
      beforeDestroy() {
        stub()
      }
    }).destroy()
    expect(stub.calledOnce).toEqual(true)
  })

  it('triggers destroy ', () => {
    const stub = sandbox.stub()
    mountingMethod({
      render: () => {},
      destroyed() {
        stub()
      }
    }).destroy()
    expect(stub.calledOnce).toEqual(true)
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
})
