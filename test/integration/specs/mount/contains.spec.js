import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import ComponentWithChildComponent from '../../../resources/components/component-with-child-component.vue'
import Component from '../../../resources/components/component.vue'

describe('contains', () => {
  it('returns true if wrapper contains element', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.contains('input')).to.equal(true)
  })

  it('returns true if wrapper contains Vue component', () => {
    const wrapper = mount(ComponentWithChildComponent)
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('returns false if wrapper does not contain element', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.contains('doesntexist')).to.equal(false)
  })

  it('throws an error if selector is not a valid avoriaz selector', () => {
    const wrapper = mount(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.contains() must be passed a valid CSS selector or a Vue constructor'
      expect(() => wrapper.contains(invalidSelector)).to.throw(Error, message)
    })
  })
})
