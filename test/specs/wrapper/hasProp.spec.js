import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('hasProp', (mountingMethod) => {
  it('returns true if wrapper has prop', () => {
    const prop1 = {}
    const prop2 = 'a prop'
    const wrapper = mountingMethod(ComponentWithProps, {
      propsData: { prop1, prop2 }
    })
    expect(wrapper.hasProp('a-class')).to.equal(true)
  })

  it('returns false if wrapper does not have class name', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.hasProp('no-prop', 'value')).to.equal(false)
  })

  it('throws an error if called on a non vm wrapper', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const p = mountingMethod(compiled).findAll('p').at(0)
    const message = '[vue-test-utils]: wrapper.hasProp() must be called on a Vue instance'
    const fn = () => p.hasProp('no-prop', 'value')
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws an error if prop is not a string', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.hasProp() must be passed prop as a string'
      const fn = () => wrapper.hasProp(invalidSelector, 'value')
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
