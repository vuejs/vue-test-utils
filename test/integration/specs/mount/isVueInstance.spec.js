import mount from '../../../../src/mount'
import { compileToFunctions } from 'vue-template-compiler'

describe('isVueInstance', () => {
  it('returns true if wrapper is Vue instance', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.isVueInstance()).to.equal(true)
  })

  it('returns the tag name of the element if it is not a Vue component', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.find('p').isVueInstance()).to.equal(false)
  })
})

