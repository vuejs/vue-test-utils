import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'

describe('setData', () => {
  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const TestComponent = {
      render: h => h(ComponentWithVIf)
    }
    const wrapper = mount(TestComponent)
    const componentArr = wrapper.findAll(ComponentWithVIf)
    expect(componentArr.at(0).findAll('.child.ready').length).to.equal(0)
    componentArr.setData({ ready: true })
    expect(componentArr.at(0).findAll('.child.ready').length).to.equal(1)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = '[vue-test-utils]: wrapper.setData() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mount(compiled)
    const fn = () => wrapper.findAll('p').setData({ ready: true })
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: setData cannot be called on 0 items'
    const fn = () => mount(compiled).findAll('p').setData('p')
    expect(fn).to.throw().with.property('message', message)
  })
})
