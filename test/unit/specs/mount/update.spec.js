import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'

describe('update', () => {
    // TODO: Improve this test
  it('causes vm to re render', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mount(compiled)
    expect(wrapper.vm.bar).to.equal(undefined)
    wrapper.vm.bar = 'new value'
    wrapper.update()
    expect(wrapper.vm.bar).to.equal('new value')
  })

  it('causes vm to re render, and retain slots', () => {
    const compiled = compileToFunctions('<div><slot></slot></div>')
    const wrapper = mount(compiled, { slots: { default: [compileToFunctions('<div class="test-div" />')] }})
    expect(wrapper.find('.test-div').length).to.equal(1)
    wrapper.update()
    expect(wrapper.find('.test-div').length).to.equal(1)
  })
})
