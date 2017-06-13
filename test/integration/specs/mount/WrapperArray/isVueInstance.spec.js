import mount from '~src/mount'
import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChildComponent from '../../../../resources/components/component-with-child-component.vue'
import Component from '../../../../resources/components/component.vue'

describe('isVueInstance', () => {
  it('returns true if wrapper is Vue instance', () => {
    const wrapper = mount(ComponentWithChildComponent)
    expect(wrapper.findAll(Component).isVueInstance()).to.equal(true)
  })

  it('returns the tag name of the element if it is not a Vue component', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.findAll('p').isVueInstance()).to.equal(false)
  })
})

