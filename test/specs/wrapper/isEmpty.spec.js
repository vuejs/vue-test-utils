import { compileToFunctions } from 'vue-template-compiler'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('isEmpty', (mountingMethod) => {
  it('returns true if node is empty', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mountingMethod(compiled)

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
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.find('svg').isEmpty()).to.equal(true)
  })

  it.skip('returns false if innerHTML is not empty', () => {
    const TestComponent = {
      render (createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg><p>not empty</p></svg>'
          }
        })
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.find('svg').isEmpty()).to.equal(false)
  })

  it('returns true contains empty slot', () => {
    const compiled = compileToFunctions('<div><slot></slot></div>')
    const wrapper = mountingMethod(compiled)

    expect(wrapper.isEmpty()).to.equal(true)
  })

  it('returns false if node contains other nodes', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const wrapper = mountingMethod(compiled)

    expect(wrapper.isEmpty()).to.equal(false)
  })
})
