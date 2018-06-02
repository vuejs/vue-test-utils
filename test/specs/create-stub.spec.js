import ComponentWithChild from '~resources/components/component-with-child.vue'
import { describeWithShallowAndMount } from '~resources/utils'
import { shallow, createStub } from '~vue/test-utils'

describeWithShallowAndMount('createStub', (mountingMethod) => {
  it('stubs a component', () => {
    const ChildComponent = createStub('TestComponent')
    const wrapper = mountingMethod(ComponentWithChild, {
      stubs: {
        'child-component': ChildComponent
      }
    })

    expect(wrapper.findAll(ChildComponent).length).to.equal(1)
  })
})
