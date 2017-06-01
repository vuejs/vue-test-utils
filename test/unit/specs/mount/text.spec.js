import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'

describe('text', () => {
  it('returns text content of wrapper node', () => {
    const text = 'test text prop'
    const compiled = compileToFunctions(`<div>${text}</div>`)
    const wrapper = mount(compiled)

    expect(wrapper.text()).to.equal(text)
  })
})
