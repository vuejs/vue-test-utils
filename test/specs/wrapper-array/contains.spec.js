import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'

describe('contains', () => {
  it('returns true if every Wrapper contains element', () => {
    const compiled = compileToFunctions('<span><div><p /></div><div><p /></div></span>')
    const wrapper = mount(compiled)
    const divArr = wrapper.findAll('div')
    expect(divArr.contains('p')).to.equal(true)
  })

  it('returns false if any Wrapper does not contain element', () => {
    const compiled = compileToFunctions('<div><div></div><div><p /></div></div>')
    const wrapper = mount(compiled)
    const divArr = wrapper.findAll('div')
    expect(divArr.contains('p')).to.equal(false)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: contains cannot be called on 0 items'
    expect(() => mount(compiled).findAll('p').contains('p')).to.throw().with.property('message', message)
  })

  it('throws error if selector is not a valid selector', () => {
    const compiled = compileToFunctions('<div><p></p></div>')
    const wrapper = mount(compiled)
    const pArr = wrapper.findAll('p')
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.contains() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      expect(() => pArr.contains(invalidSelector)).to.throw().with.property('message', message)
    })
  })
})
