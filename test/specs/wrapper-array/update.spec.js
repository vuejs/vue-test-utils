import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'
import ComponentWithVIf from '~resources/components/component-with-v-if.vue'

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

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: update cannot be called on 0 items'
    const fn = () => mount(compiled).findAll('p').update('p')
    expect(fn).to.throw().with.property('message', message)
  })
})
