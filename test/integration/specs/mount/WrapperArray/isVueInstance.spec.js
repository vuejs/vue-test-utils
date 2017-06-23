import mount from '~src/mount'
import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChildComponent from '~resources/components/component-with-child-component.vue'
import Component from '~resources/components/component.vue'

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

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = 'isVueInstance cannot be called on 0 items'
    expect(() => mount(compiled).findAll('p').isVueInstance('p')).to.throw(Error, message)
  })
})

