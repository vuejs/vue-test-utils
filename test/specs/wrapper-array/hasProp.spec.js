import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import Component from '~resources/components/component.vue'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('hasProp', mountingMethod => {
  it('returns false if every item does not have prop', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.findAll(Component).hasProp('no-prop', 'value')).to.equal(
      false
    )
  })

  it('throws error if items are not Vue components', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const p = mountingMethod(compiled)
      .findAll('p')
      .at(0)
    const message =
      '[vue-test-utils]: wrapper.hasProp() must be called on a Vue instance'
    expect(() => p.hasProp('no-prop', 'value'))
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: hasProp cannot be called on 0 items'
    expect(() =>
      mountingMethod(compiled)
        .findAll('p')
        .hasProp('p')
    )
      .to.throw()
      .with.property('message', message)
  })

  it('throws error if prop is not a string', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const invalidSelectors = [
      undefined,
      null,
      NaN,
      0,
      2,
      true,
      false,
      () => {},
      {},
      []
    ]
    invalidSelectors.forEach(invalidSelector => {
      const message =
        '[vue-test-utils]: wrapper.hasProp() must be passed prop as a string'
      const fn = () =>
        wrapper.find(Component).hasProp(invalidSelector, 'value')
      expect(fn)
        .to.throw()
        .with.property('message', message)
    })
  })
})
