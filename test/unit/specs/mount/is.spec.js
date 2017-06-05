import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../../src/mount'
import ComponentWithChildComponent from '../../../resources/components/component-with-child-component.vue'
import Component from '../../../resources/components/component.vue'

describe('is', () => {
  it('returns true if root node matches tag selector', () => {
    const compiled = compileToFunctions('<input />')
    const wrapper = mount(compiled)
    expect(wrapper.is('input')).to.equal(true)
  })

  it('returns true if root node matches class selector', () => {
    const compiled = compileToFunctions('<div class="div" />')
    const wrapper = mount(compiled)
    expect(wrapper.is('.div')).to.equal(true)
  })

  it('returns true if root node matches id selector', () => {
    const compiled = compileToFunctions('<div id="div" />')
    const wrapper = mount(compiled)
    expect(wrapper.is('#div')).to.equal(true)
  })

  it('returns true if root node matches Vue Component selector', () => {
    const wrapper = mount(ComponentWithChildComponent)
    const component = wrapper.findAll(Component).at(0)
    expect(component.is(Component)).to.equal(true)
  })

  it('returns false if root node is not a Vue Component', () => {
    const wrapper = mount(ComponentWithChildComponent)
    const input = wrapper.findAll('span').at(0)
    expect(input.is(Component)).to.equal(false)
  })

  it('returns false if root node does not match tag selector', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.is('p')).to.equal(false)
  })

  it('returns false if root node does not match class selector', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.is('.p')).to.equal(false)
  })

  it('returns false if root node does not match id selector', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.is('#p')).to.equal(false)
  })

  it('throws an error if selector is not a valid selector', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.is() must be passed a valid CSS selector or a Vue constructor'
      expect(() => wrapper.is(invalidSelector)).to.throw(Error, message)
    })
  })
})
