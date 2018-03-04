import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'

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

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: hasClass cannot be called on 0 items'
    expect(() => mount(compiled).findAll('p').hasClass('p')).to.throw().with.property('message', message)
  })

  it('throws error if selector is not a string', () => {
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
