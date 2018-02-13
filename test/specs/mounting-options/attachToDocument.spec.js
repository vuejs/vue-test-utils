import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/test-utils'

describeWithShallowAndMount('options.attachToDocument', (mountingMethod) => {
  it('returns VueWrapper with attachedToDocument set to true when passed attachToDocument in options', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mountingMethod(compiled, { attachToDocument: true })
    expect(wrapper.options.attachedToDocument).to.equal(true)
  })
})
