import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('text', mountingMethod => {
  it('returns text content of wrapper node', () => {
    const text = 'test text prop'
    const compiled = compileToFunctions(`<div>${text}</div>`)
    const wrapper = mountingMethod(compiled)

    expect(wrapper.text()).to.equal(text)
  })

  it('returns trimmed text content of wrapper node', () => {
    const text = 'test text prop'
    const compiled = compileToFunctions(`
      <div>
      ${text}
    </div>`)
    const wrapper = mountingMethod(compiled)

    expect(wrapper.text()).to.equal(text)
  })
})
