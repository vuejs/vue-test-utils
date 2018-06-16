import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import Component from '~resources/components/component.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('isVueInstance', mountingMethod => {
  it('returns true if wrapper is Vue instance', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.findAll(Component).isVueInstance()).to.equal(true)
  })

  it('returns the tag name of the element if it is not a Vue component', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.findAll('p').isVueInstance()).to.equal(false)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message =
      '[vue-test-utils]: isVueInstance cannot be called on 0 items'
    const fn = () =>
      mountingMethod(compiled)
        .findAll('p')
        .isVueInstance('p')
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })
})
