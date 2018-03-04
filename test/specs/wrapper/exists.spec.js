import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('exists', (mountingMethod) => {
  it('returns true if called on Wrapper', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.exists()).to.equal(true)
  })

  it('returns false if Wrapper is destroyed', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    wrapper.destroy()
    expect(wrapper.exists()).to.equal(false)
  })

  it('returns false if called on an ErrorWrapper', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('does-not-exist').exists()).to.equal(false)
  })
})
