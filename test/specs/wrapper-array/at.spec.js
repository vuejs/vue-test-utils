import { describeWithShallowAndMount } from '~resources/utils'
import '~vue/test-utils'

describeWithShallowAndMount('at', mountingMethod => {
  it('returns Wrapper at index', () => {
    const TestComponent = {
      template: '<div><p /><p class="index-1"/></div>'
    }
    const p = mountingMethod(TestComponent)
      .findAll('p')
      .at(1)
    expect(p.vnode).to.be.an('object')
    expect(p.classes()).to.contain('index-1')
  })

  it('throws error if no item exists at index', () => {
    const index = 2
    const TestComponent = {
      template: '<div><p /><p class="index-1"/></div>'
    }
    const message = `[vue-test-utils]: no item exists at ${index}`
    expect(() =>
      mountingMethod(TestComponent)
        .findAll('p')
        .at(index)
    )
      .to.throw()
      .with.property('message', message)
  })
})
