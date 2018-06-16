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

  it('throws error if wrapper does not contain element', () => {
    const wrapper = mountingMethod({ template: '<div><p/></div>' })
    const p = wrapper.find('p')
    p.element = null
    const fn = () => p.text()
    const message = '[vue-test-utils]: cannot call wrapper.text() on a wrapper without an element'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })
})
