import { compileToFunctions } from 'vue-template-compiler'
import { mount } from '~vue-test-utils'

describe('isEmpty', () => {
  it('returns true if node is empty', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mount(compiled)

    expect(wrapper.isEmpty()).to.equal(true)
  })

  it('returns true if innerHTML is empty', () => {
    const TestComponent = {
      render (createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg />'
          }
        })
      }
    }
    const wrapper = mount(TestComponent)
    expect(wrapper.find('svg').isEmpty()).to.equal(true)
  })

  it('returns false if innerHTML is not empty', () => {
    if (/HeadlessChrome/.test(window.navigator.userAgent)) {
      return
    }
    const TestComponent = {
      render (createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg><p>not empty</p></svg>'
          }
        })
      }
    }
    const wrapper = mount(TestComponent)
    expect(wrapper.find('svg').isEmpty()).to.equal(false)
  })

  it('returns true contains empty slot', () => {
    const compiled = compileToFunctions('<div><slot></slot></div>')
    const wrapper = mount(compiled)

    expect(wrapper.isEmpty()).to.equal(true)
  })

  it('returns false if node contains other nodes', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mount(compiled)

    expect(wrapper.isEmpty()).to.equal(false)
  })
})
