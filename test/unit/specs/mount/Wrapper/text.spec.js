import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChildIncrease from '~resources/components/component-with-child-increase.vue'
import mount from '~src/mount'

describe('text', () => {
  it('returns text content of wrapper node', () => {
    const text = 'test text prop'
    const compiled = compileToFunctions(`<div>${text}</div>`)
    const wrapper = mount(compiled)

    expect(wrapper.text()).to.equal(text)
  })

  it('returns trimmed text content of wrapper node', () => {
    const text = 'test text prop'
    const compiled = compileToFunctions(`
      <div>
      ${text}
    </div>`)
    const wrapper = mount(compiled)

    expect(wrapper.text()).to.equal(text)
  })

  it('throws error if wrapper does not contain element', () => {
    const wrapper = mount(ComponentWithChildIncrease)
    const span = wrapper.find('#span')
    span.element = null
    const fn = () => span.text()
    const message = '[vue-test-utils]: cannot call wrapper.text() on a wrapper without an element'
    expect(fn).to.throw().with.property('message', message)
  })
})
