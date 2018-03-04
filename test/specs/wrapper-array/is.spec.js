import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue/test-utils'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import Component from '~resources/components/component.vue'

describe('is', () => {
  it('returns true if ech item matches selector', () => {
    const compiled = compileToFunctions('<div><div></div></div>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div').is('div')).to.equal(true)
  })

  it('returns true if each item matches Vue Component selector', () => {
    const wrapper = mount(ComponentWithChild)
    const component = wrapper.findAll(Component).at(0)
    expect(component.is(Component)).to.equal(true)
  })

  it('returns false if each item is not a Vue Component', () => {
    const wrapper = mount(ComponentWithChild)
    const input = wrapper.findAll('span').at(0)
    expect(input.is(Component)).to.equal(false)
  })

  it('returns false if each item does not match tag selector', () => {
    const compiled = compileToFunctions('<div><div class="a-class"></div><div></div></div>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('div').is('.a-class')).to.equal(false)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: is cannot be called on 0 items'
    const fn = () => mount(compiled).findAll('p').is('p')
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if selector is not a valid selector', () => {
    const compiled = compileToFunctions('<div><div></div></div>')
    const wrapper = mount(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.is() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      const fn = () => wrapper.findAll('div').is(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
