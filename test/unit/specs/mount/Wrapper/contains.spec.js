import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import Component from '~resources/components/component.vue'

describe('contains', () => {
  it('returns true if wrapper contains element', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.contains('input')).to.equal(true)
  })

  it('returns true if wrapper contains Vue component', () => {
    const wrapper = mount(ComponentWithChild)
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('returns true if wrapper contains element specified by ref selector', () => {
    const compiled = compileToFunctions('<div><input ref="foo" /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.contains({ ref: 'foo' })).to.equal(true)
  })

  it('throws an error when ref selector is called on a wrapper that is not a Vue component', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mount(compiled)
    const a = wrapper.find('a')
    const message = '[vue-test-utils]: $ref selectors can only be used on Vue component wrappers'
    const fn = () => a.contains({ ref: 'foo' })
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns false if wrapper does not contain element', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.contains('doesntexist')).to.equal(false)
  })

  it('returns false if wrapper does not contain element specified by ref selector', () => {
    const compiled = compileToFunctions('<div><input ref="bar" /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.contains({ ref: 'foo' })).to.equal(false)
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = mount(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, { ref: 'foo', nope: true }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.contains() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      const fn = () => wrapper.contains(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
