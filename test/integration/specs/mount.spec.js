import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithMixin from '~resources/components/component-with-mixin.vue'

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

  it('does not use cached component', () => {
    ComponentWithMixin.methods.someMethod = sinon.stub()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod.callCount).to.equal(1)
    ComponentWithMixin.methods.someMethod = sinon.stub()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod.callCount).to.equal(1)
  })
})
