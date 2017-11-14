import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import Component from '~resources/components/component.vue'

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

  it('returns false if wrapper does not contain element', () => {
    const wrapper = mount(ComponentWithChild)
    wrapper.element = null
    expect(wrapper.is('a')).to.equal(false)
  })

  it('returns true if root node matches Vue Component selector', () => {
    const wrapper = mount(ComponentWithChild)
    const component = wrapper.findAll(Component).at(0)
    expect(component.is(Component)).to.equal(true)
  })

  it('returns true if root node matches Component', () => {
    const wrapper = mount(Component)
    expect(wrapper.is(Component)).to.equal(true)
  })

  it('returns false if root node is not a Vue Component', () => {
    const wrapper = mount(ComponentWithChild)
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

  it('throws error if ref options object is passed', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)

    const message = '[vue-test-utils]: $ref selectors can not be used with wrapper.is()'
    const fn = () => wrapper.is({ ref: 'foo' })
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws error if component passed to use as identifier does not have a name', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)

    const message = '[vue-test-utils]: a Component used as a selector must have a name property'
    const fn = () => wrapper.is({ render: () => {} })
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws an error if selector is not a valid selector', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, { ref: 'foo', nope: true }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.is() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      const fn = () => wrapper.is(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
