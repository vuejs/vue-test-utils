import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

describe('text', () => {
  it('returns text content of wrapper node', () => {
    const text = 'test text prop'
    const compiled = compileToFunctions(`<div>${text}</div>`)
    const wrapper = mount(compiled)

    expect(wrapper.text()).to.equal(text)
  })

  it('throws error if wrapper does not contain eleemnt', () => {
    const compiled = compileToFunctions(`<div />`)
    const wrapper = mount(compiled)
    wrapper.element = null
    const fn = () => wrapper.text()
    const message = '[vue-test-utils]: cannot call wrapper.text() on a wrapper without an element'
    expect(fn).to.throw().with.property('message', message)
  })
})
