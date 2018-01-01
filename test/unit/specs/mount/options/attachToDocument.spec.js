import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue-test-utils'

describe('mount.attachToDocument', () => {
  it('returns VueWrapper with attachedToDocument set to true when passed attachToDocument in options', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled, { attachToDocument: true })
    expect(wrapper.options.attachedToDocument).to.equal(true)
  })
})
