import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('hasClass', () => {
  it('returns true if wrapper has class name', () => {
    const compiled = compileToFunctions('<div class="a-class" />')
    const wrapper = mount(compiled)
    expect(wrapper.hasClass('a-class')).to.equal(true)
  })

  it('returns false if wrapper does not have class name', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.hasClass('not-class-name')).to.equal(false)
  })

  it('throws an error if selector is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.hasClass() must be passed a string'
      const fn = () => wrapper.hasClass(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
