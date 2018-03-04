import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import Component from '~resources/components/component.vue'
import FunctionalComponent from '~resources/components/functional-component.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import {
  functionalSFCsSupported,
  describeWithShallowAndMount
} from '~resources/utils'
import ComponentWithoutName from '~resources/components/component-without-name.vue'

describeWithShallowAndMount('contains', (mountingMethod) => {
  it('returns true if wrapper contains element', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.contains('input')).to.equal(true)
  })

  it('returns true if wrapper contains Vue component', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('returns true if wrapper contains functional Vue component', () => {
    if (!functionalSFCsSupported()) {
      return false
    }
    const TestComponent = {
      template: `
        <div>
          <functional-component />
        </div>
      `,
      components: {
        FunctionalComponent
      }
    }

    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.contains(FunctionalComponent)).to.equal(true)
  })

  it('returns true if wrapper contains Vue class component', () => {
    const TestComponent = {
      template: `
        <div>
          <component-as-a-class />
        </div>
      `,
      components: {
        ComponentAsAClass
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.contains(ComponentAsAClass)).to.equal(true)
  })

  it('returns true if wrapper contains element specified by ref selector', () => {
    const compiled = compileToFunctions('<div><input ref="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.contains({ ref: 'foo' })).to.equal(true)
  })

  it('throws an error when ref selector is called on a wrapper that is not a Vue component', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const a = wrapper.find('a')
    const message = '[vue-test-utils]: $ref selectors can only be used on Vue component wrappers'
    const fn = () => a.contains({ ref: 'foo' })
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns true when wrapper contains root element', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.contains('doesntexist')).to.equal(false)
  })

  it('returns true if wrapper root element matches contains', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.contains('doesntexist')).to.equal(false)
  })

  it('returns true if wrapper root Component matches selector', () => {
    const TestComponent = {
      template: `
        <div>
            <component-without-name />
        </div>
      `,
      components: {
        ComponentWithoutName
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.contains(ComponentWithoutName)).to.equal(true)
  })

  it('returns true if wrapper root Component matches selector', () => {
    const wrapper = mountingMethod(Component)
    expect(wrapper.contains(Component)).to.equal(true)
  })

  it('returns false if wrapper does not contain element', () => {
    const compiled = compileToFunctions('<div></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.contains('div')).to.equal(true)
  })

  it('returns false if wrapper does not contain element specified by ref selector', () => {
    const compiled = compileToFunctions('<div><input ref="bar" /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.contains({ ref: 'foo' })).to.equal(false)
  })

  it('works correctly with innerHTML', () => {
    const TestComponent = {
      render (createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg></svg>'
          }
        })
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.contains('svg')).to.equal(true)
    expect(wrapper.find('svg').contains('svg')).to.equal(true)
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = mountingMethod(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, { ref: 'foo', nope: true }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.contains() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      const fn = () => wrapper.contains(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
