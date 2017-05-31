import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import ComponentWithProps from '../../../resources/components/component-with-props.vue'

describe('setProps', () => {
  it('sets component props and updates DOM when called on Vue instance', () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop 2'
    const propsData = { prop1: 'a prop', prop2 }
    const wrapper = mount(ComponentWithProps, { propsData })
    wrapper.setProps({ prop1 })
    expect(wrapper.find('.prop-1')[0].element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2')[0].element.textContent).to.equal(prop2)
  })

  it('sets component props, and updates DOM when propsData was not initially passed', () => {
    const prop1 = 'prop 1'
    const prop2 = 'prop s'
    const wrapper = mount(ComponentWithProps)
    wrapper.setProps({ prop1, prop2 })
    expect(wrapper.find('.prop-1')[0].element.textContent).to.equal(prop1)
    expect(wrapper.find('.prop-2')[0].element.textContent).to.equal(prop2)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setProps() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mount(compiled)
    const input = wrapper.find('p')[0]
    expect(() => input.setProps({ ready: true })).throw(Error, message)
  })
})
