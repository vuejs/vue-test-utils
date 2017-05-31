import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import ComponentWithVIf from '../../../resources/components/component-with-v-if.vue'

describe('setData', () => {
  it('sets component data and updates nested vm nodes when called on Vue instance', () => {
    const wrapper = mount(ComponentWithVIf)
    expect(wrapper.find('.child.ready').length).to.equal(0)
    wrapper.setData({ ready: true })
    expect(wrapper.find('.child.ready').length).to.equal(1)
  })

  it('throws an error if node is not a Vue instance', () => {
    const message = 'wrapper.setData() can only be called on a Vue instance'
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mount(compiled)
    const input = wrapper.find('p')[0]
    expect(() => input.setData({ ready: true })).throw(Error, message)
  })
})
