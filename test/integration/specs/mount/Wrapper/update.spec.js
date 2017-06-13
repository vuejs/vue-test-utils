import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithVIf from '../../../../resources/components/component-with-v-if.vue'

describe('update', () => {
  it('causes vm to re render', () => {
    const wrapper = mount(ComponentWithVIf)
    expect(wrapper.findAll('.child.ready').length).to.equal(0)
    wrapper.vm.$set(wrapper.vm, 'ready', true)
    wrapper.update()
    expect(wrapper.findAll('.child.ready').length).to.equal(1)
  })

  it('causes vm to re render, and retain slots', () => {
    const compiled = compileToFunctions('<div><slot></slot></div>')
    const wrapper = mount(compiled, { slots: { default: [compileToFunctions('<div class="test-div" />')] }})
    expect(wrapper.findAll('.test-div').length).to.equal(1)
    wrapper.update()
    expect(wrapper.findAll('.test-div').length).to.equal(1)
  })
})
