import { compileToFunctions } from 'vue-template-compiler'
import shallow from '~src/shallow'

describe('hasClass', () => {
  it('returns true if wrapper has class name', () => {
    const compiled = compileToFunctions('<div class="a-class" />')
    const wrapper = shallow(compiled)
    expect(wrapper.hasClass('a-class')).to.equal(true)
  })

  it('returns true if wrapper has dynamic class name', () => {
    const compiled = compileToFunctions('<div v-bind:class="{ foo: true }" />')
    const wrapper = shallow(compiled)
    expect(wrapper.hasClass('foo')).to.equal(true)
  })

  it('returns false if wrapper does not have class name', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    expect(wrapper.hasClass('not-class-name')).to.equal(false)
  })

  it('throws an error if selector is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = shallow(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.hasClass() must be passed a string'
      expect(() => wrapper.hasClass(invalidSelector)).to.throw(Error, message)
    })
  })
})
