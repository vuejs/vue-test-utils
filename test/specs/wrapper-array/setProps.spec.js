import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import { describeWithShallowAndMount } from '~resources/utils'
import Vue from 'vue'

describeWithShallowAndMount('setProps', mountingMethod => {
  it('sets component props and updates DOM when called on Vue instance', async () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop 2'
    const propsData = { prop1: 'a prop', prop2 }
    const wrapper = mountingMethod(ComponentWithProps, { propsData })
    wrapper.findAll(ComponentWithProps).setProps({ prop1 })
    await Vue.nextTick()
    expect(wrapper.find('.prop-1').element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2').element.textContent).to.equal(prop2)
  })

  it('sets component props when propsData was not initially passed', async () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop s'
    const wrapper = mountingMethod(ComponentWithProps)
    wrapper.findAll(ComponentWithProps).setProps({ prop1, prop2 })
    await Vue.nextTick()
    expect(wrapper.find('.prop-1').element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2').element.textContent).to.equal(prop2)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message =
      '[vue-test-utils]: wrapper.setProps() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const p = wrapper.findAll('p')
    const fn = () => p.setProps({ ready: true })
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: setProps cannot be called on 0 items'
    const fn = () =>
      mountingMethod(compiled)
        .findAll('p')
        .setProps('p')
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })
})
