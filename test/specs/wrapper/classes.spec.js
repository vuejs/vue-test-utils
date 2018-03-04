import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithCssModules from '~resources/components/component-with-css-modules.vue'

describeWithShallowAndMount('classes', (mountingMethod) => {
  it('returns array of class names if wrapper has class names', () => {
    const compiled = compileToFunctions('<div class="a-class b-class" />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.classes()).to.contain('a-class')
    expect(wrapper.classes()).to.contain('b-class')
  })

  it('returns empty array if wrapper has no classes', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.classes().length).to.equal(0)
  })

  it('returns original class names when element mapped in css modules', () => {
    const wrapper = mountingMethod(ComponentWithCssModules)
    expect(wrapper.classes()).to.eql(['extension', 'color-red'])
  })

  it('returns array of class names for svg element', () => {
    const compiled = compileToFunctions('<svg class="a-class b-class"><text class="c-class"/></svg>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.classes()).to.contain('a-class')
    expect(wrapper.classes()).to.contain('b-class')
    expect(wrapper.find('text').classes()).to.contain('c-class')
  })
})
