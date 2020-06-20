import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithCssModules from '~resources/components/component-with-css-modules.vue'

describeWithShallowAndMount('classes', mountingMethod => {
  it('returns array of class names if wrapper has class names', () => {
    const compiled = compileToFunctions('<div class="a-class b-class" />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.classes()).toContain('a-class')
    expect(wrapper.classes()).toContain('b-class')
  })

  it('returns empty array if wrapper has no classes', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.classes().length).toEqual(0)
  })

  it('returns original class names when element mapped in css modules', () => {
    const wrapper = mountingMethod(ComponentWithCssModules)
    expect(wrapper.classes()).to.eql(['extension', 'color-red'])
  })

  it('returns array of class names for svg element', () => {
    const compiled = compileToFunctions(
      '<svg class="a-class b-class"><text class="c-class"/></svg>'
    )
    const wrapper = mountingMethod(compiled)
    expect(wrapper.classes()).toContain('a-class')
    expect(wrapper.classes()).toContain('b-class')
    expect(wrapper.find('text').classes()).toContain('c-class')
  })

  it('returns true if the element has the class', () => {
    const compiled = compileToFunctions(
      '<svg class="a-class b-class"><text class="c-class"/></svg>'
    )
    const wrapper = mountingMethod(compiled)
    expect(wrapper.classes('a-class')).to.eql(true)
    expect(wrapper.classes('b-class')).to.eql(true)
    expect(wrapper.find('text').classes('c-class')).to.eql(true)
    expect(wrapper.classes('x-class')).to.eql(false)
  })

  it('returns false if the element does not have the class', () => {
    const wrapper = mountingMethod(ComponentWithCssModules)
    expect(wrapper.classes('x-class')).to.eql(false)
  })
})
