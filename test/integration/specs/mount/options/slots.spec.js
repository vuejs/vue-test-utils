import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../../src/mount'
import Component from '../../../../resources/components/component.vue'
import ComponentWithSlots from '../../../../resources/components/component-with-slots.vue'

describe('slots', () => {
  it('mounts component with default slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: [Component] }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed object with template prop in slot object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: [Component] }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: [Component] }})
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('mounts component with default slot if passed object with template prop in slot object', () => {
    const compiled = compileToFunctions('<div id="div" />')
    const wrapper = mount(ComponentWithSlots, { slots: { default: [compiled] }})
    expect(wrapper.contains('#div')).to.equal(true)
  })

  it('mounts component with default slot if passed string in slot object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: '<span />' }})
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('mounts component with default slot if passed string in slot array object', () => {
    const wrapper = mount(ComponentWithSlots, { slots: { default: ['<span />'] }})
    expect(wrapper.contains('span')).to.equal(true)
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        header: [Component],
        footer: [Component]
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(2)
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        header: Component
      }
    })
    expect(wrapper.findAll(Component).length).to.equal(1)
    expect(Array.isArray(wrapper.vm.$slots.header)).to.equal(true)
  })
})
