import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import '~vue/test-utils'

describeWithShallowAndMount('find', mountingMethod => {
  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: find cannot be called on 0 items'
    expect(() =>
      mountingMethod(compiled)
        .findAll('p')
        .find('p')
    )
      .to.throw()
      .with.property('message', message)
  })

  it('throws an error when called on a WrapperArray', () => {
    const compiled = compileToFunctions(
      '<div><div></div><div><p /></div></div>'
    )
    const wrapper = mountingMethod(compiled)
    const message =
      '[vue-test-utils]: find must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapper.findAll('div').find('div'))
      .to.throw()
      .with.property('message', message)
  })
})
