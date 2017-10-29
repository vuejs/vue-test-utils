
import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('classes', () => {
  it('returns array of class names if wrapper has class names', () => {
    const compiled = compileToFunctions('<div class="a-class b-class" />')
    const wrapper = mount(compiled)
    expect(wrapper.classes()).to.eql(['a-class', 'b-class'])
  })

  it('returns empty array if wrapper has no classes', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.classes()).to.eql([])
  })
})
