import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'

describe('isEmpty', () => {
  it('returns true if node is empty', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mount(compiled)

    expect(wrapper.isEmpty()).to.equal(true)
  })

  it('returns false if node contains other nodes', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mount(compiled)

    expect(wrapper.isEmpty()).to.equal(false)
  })
})
