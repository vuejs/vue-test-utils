import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../../src/mount'
import ComponentWithVIf from '../../../../resources/components/component-with-v-if.vue'

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
    const message = 'wrapper.setData() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mount(compiled)
    expect(() => wrapper.findAll('p').setData({ ready: true })).throw(Error, message)
  })
})
