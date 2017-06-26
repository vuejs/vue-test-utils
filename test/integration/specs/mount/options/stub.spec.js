import mount from '~src/mount'
import ComponentWithChildComponent from '~resources/components/component-with-child-component.vue'
import Component from '~resources/components/component.vue'

describe('mount.stub', () => {
  it('replaces component with template string ', () => {
    const wrapper = mount(ComponentWithChildComponent, {
      stub: {
        ChildComponent: '<div class="stub"></div>'
      }
    })
    expect(wrapper.findAll('.stub').length).to.equal(1)
    expect(wrapper.findAll(Component).length).to.equal(1)
  })
})
