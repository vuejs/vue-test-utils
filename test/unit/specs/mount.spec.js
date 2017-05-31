import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../src/mount'
import ComponentWithProps from '../../resources/components/component-with-props.vue'
import Component from '../../resources/components/component.vue'
import ComponentWithSlots from '../../resources/components/component-with-slots.vue'
import ComponentWithMixin from '../../resources/components/component-with-mixin.vue'

describe('mount', () => {
  it('returns new VueWrapper with mounted Vue instance if no options are passed', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('node.js')) {
      return
    }
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.vm).to.be.an('object')
  })

  it('returns new VueWrapper with mounted Vue instance with props, if passed as propsData', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('node.js')) {
      return
    }
    const prop1 = { test: 'TEST' }
    const wrapper = mount(ComponentWithProps, { propsData: { prop1 }})
    expect(wrapper.vm).to.be.an('object')
    expect(wrapper.vm.$props.prop1).to.equal(prop1)
  })

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

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        header: [Component],
        footer: [Component]
      }
    })
    expect(wrapper.find(Component).length).to.equal(2)
  })

  it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        header: Component
      }
    })
    expect(wrapper.find(Component).length).to.equal(1)
    expect(Array.isArray(wrapper.vm.$slots.header)).to.equal(true)
  })

  it('returns VueWrapper with mountedToDom set to true when passed attachToDocument in options', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled, { attachToDocument: true })
    expect(wrapper.mountedToDom).to.equal(true)
  })

  it('injects global variables when passed as intercept object', () => {
    const $store = { store: true }
    const $route = { path: 'http://avoriaz.com' }
    const wrapper = mount(Component, {
      intercept: {
        $store,
        $route
      }
    })
    expect(wrapper.vm.$store).to.equal($store)
    expect(wrapper.vm.$route).to.equal($route)
  })

  it('does not use cached component', () => {
    ComponentWithMixin.methods.someMethod = sinon.stub()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod.callCount).to.equal(1)
    ComponentWithMixin.methods.someMethod = sinon.stub()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod.callCount).to.equal(1)
  })
})
