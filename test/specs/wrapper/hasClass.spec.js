import ComponentWithCssModules from '~resources/components/component-with-css-modules.vue'
import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('hasClass', (mountingMethod) => {
  it('returns true if wrapper has class name', () => {
    const compiled = compileToFunctions('<div class="a-class" />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.hasClass('a-class')).to.equal(true)
  })

  it('returns false if wrapper does not have class name', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.hasClass('not-class-name')).to.equal(false)
  })

  it('returns false if wrapper includes class name in string, but not as a seperate class', () => {
    const compiled = compileToFunctions('<div class="class-name-together"/>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.hasClass('class-name')).to.equal(false)
  })

  it('throws an error if selector is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.hasClass() must be passed a string'
      const fn = () => wrapper.hasClass(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })

  it('returns true when element contains class name mapped in css modules', () => {
    const wrapper = mountingMethod(ComponentWithCssModules)

    expect(wrapper.hasClass('color-red')).to.equal(true)
  })

  it('returns false if wrapper does not contain element', () => {
    const wrapper = mountingMethod({ render: (h) => h('div.a-class.b-class') })
    const div = wrapper.find('div')
    div.element = null
    expect(wrapper.hasClass('a-class b-class')).to.equal(false)
  })

  it('returns true when the element contains multiple classes', () => {
    const compiled = compileToFunctions('<div class="a-class b-class" />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.hasClass('a-class b-class')).to.equal(true)
  })
})
