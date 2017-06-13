import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('hasClass', () => {
  it('returns true if every item has class name', () => {
    const compiled = compileToFunctions('<span><div class="a-class" /></span>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div').hasClass('a-class')).to.equal(true)
  })

  it('returns false if every item does not have class name', () => {
    const compiled = compileToFunctions('<span><div /></span>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div').hasClass('not-class-name')).to.equal(false)
  })

  it('throws an error if selector is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.hasClass() must be passed a string'
      expect(() => wrapper.hasClass(invalidSelector)).to.throw(Error, message)
    })
  })
})
