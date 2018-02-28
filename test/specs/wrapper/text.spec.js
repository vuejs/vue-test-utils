import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('text', (mountingMethod) => {
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
  152
  it('throws error if wrapper does not contain element', () => {
    const wrapper = mountingMethod({ render: (h) => h('div') })
    const div = wrapper.find('div')
    div.element = null
    const fn = () => div.text()
    const message = '[vue-test-utils]: cannot call wrapper.text() on a wrapper without an element'
    expect(fn).to.throw().with.property('message', message)
  })
})
