import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithChildComponents from '../../../../resources/components/component-with-child-component.vue'
import Component from '../../../../resources/components/component.vue'

describe('hasProp', () => {
  it('returns false if every item does not have prop', () => {
    const wrapper = mount(ComponentWithChildComponents)
    expect(wrapper.findAll(Component).hasProp('no-prop', 'value')).to.equal(false)
  })

  it('throws an error if items are not Vue components', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const p = mount(compiled).findAll('p').at(0)
    const message = 'wrapper.hasProp() must be called on a Vue instance'
    expect(() => p.hasProp('no-prop', 'value')).to.throw(Error, message)
  })

  it('throws an error if prop is not a string', () => {
    const wrapper = mount(ComponentWithChildComponents)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = 'wrapper.hasProp() must be passed prop as a string'
      expect(() => wrapper.find(Component).hasProp(invalidSelector, 'value')).to.throw(Error, message)
    })
  })
})
