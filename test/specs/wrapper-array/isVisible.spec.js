import { describeWithShallowAndMount } from '~resources/utils'
import { compileToFunctions } from 'vue-template-compiler'
import 'packages/test-utils/src'

describeWithShallowAndMount('isVisible', mountingMethod => {
  it('returns true if node has no inline style', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mountingMethod(compiled)

    expect(wrapper.findAll('p').isVisible()).toEqual(true)
  })

  it('returns false if node has inline style display: none', () => {
    const compiled = compileToFunctions(
      '<div><p style="display: none;"><p/></div>'
    )
    const wrapper = mountingMethod(compiled)

    expect(wrapper.findAll('p').isVisible()).toEqual(false)
  })

  it('returns false if node has visibility: hidden', () => {
    const compiled = compileToFunctions(
      '<div><p style="visibility: hidden;"><p/></div>'
    )
    const wrapper = mountingMethod(compiled)

    expect(wrapper.findAll('p').isVisible()).toEqual(false)
  })

  it('throws error if wrapper array contains no items', () => {
    const compiled = compileToFunctions('<div />')
    const message = '[vue-test-utils]: isVisible cannot be called on 0 items'
    const fn = () => mountingMethod(compiled).findAll('p').isVisible('p')
    expect(fn).toThrow(message)
  })
})
