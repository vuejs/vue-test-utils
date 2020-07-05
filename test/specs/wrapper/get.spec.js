import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('get', mountingMethod => {
  it('throws describing error when element not found', () => {
    const compiled = compileToFunctions('<div/>')
    const wrapper = mountingMethod(compiled)
    expect(() => wrapper.get('.does-not-exist')).toThrow(
      'Unable to find .does-not-exist within: <div></div>'
    )
  })
  it('gets the element when element is found', () => {
    const compiled = compileToFunctions('<div class="does-exist"><div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.get('.does-exist')).toBeTruthy()
  })
})
