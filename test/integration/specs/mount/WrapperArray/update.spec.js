import mount from '~src/mount'
import ComponentWithVIf from '../../../../resources/components/component-with-v-if.vue'

describe('update', () => {
  it('causes vm to re render', () => {
    const TestComponent = {
      render: h => h(ComponentWithVIf)
    }
    const wrapper = mount(TestComponent)
    expect(wrapper.findAll('.child.ready').length).to.equal(0)
    const component = wrapper.find(ComponentWithVIf)
    component.vm.$set(component.vm, 'ready', true)
    wrapper.findAll(ComponentWithVIf).update()
    expect(wrapper.findAll('.child.ready').length).to.equal(1)
  })
})
