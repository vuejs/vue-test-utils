import { compileToFunctions } from 'vue-template-compiler'
import {
  describeWithShallowAndMount,
  isRunningPhantomJS
} from '~resources/utils'
import { itSkipIf, itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('isEmpty', mountingMethod => {
  it('returns true if node is empty', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mountingMethod(compiled)

    expect(wrapper.isEmpty()).to.equal(true)
  })

  it('returns true if node contains comment', () => {
    const compiled = compileToFunctions('<div><div v-if="false"></div></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.isEmpty()).to.equal(true)
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'returns true if node contains empty components', () => {
      const GrandChildComponent = {
        render () {}
      }
      const ChildComponent = {
        template: '<grand-child-component />',
        components: {
          GrandChildComponent
        }
      }
      const TestComponent = {
        template: `<child-component />`,
        components: {
          ChildComponent
        }
      }
      const wrapper = mountingMethod(TestComponent)
      expect(wrapper.isEmpty()).to.equal(true)
    })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'returns false if nested child component renders element', () => {
      const GrandChildComponent = {
        template: '<div />'
      }
      const ChildComponent = {
        template: '<grand-child-component />',
        components: {
          GrandChildComponent
        }
      }
      const TestComponent = {
        template: `<child-component />`,
        components: {
          ChildComponent
        }
      }
      const wrapper = mountingMethod(TestComponent)
      expect(wrapper.isEmpty()).to.equal(false)
    })

  itSkipIf(isRunningPhantomJS, 'returns true if innerHTML is empty', () => {
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

  it('returns false if innerHTML is not empty', () => {
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
