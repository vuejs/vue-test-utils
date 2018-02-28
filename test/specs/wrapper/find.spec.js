import { compileToFunctions } from 'vue-template-compiler'
import { createLocalVue } from '~vue/test-utils'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithoutName from '~resources/components/component-without-name.vue'
import ComponentWithSlots from '~resources/components/component-with-slots.vue'
import ComponentWithVFor from '~resources/components/component-with-v-for.vue'
import Component from '~resources/components/component.vue'
import FunctionalComponent from '~resources/components/functional-component.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import {
  functionalSFCsSupported,
  vueVersion,
  describeWithShallowAndMount
} from '~resources/utils'

describeWithShallowAndMount('find', (mountingMethod) => {
  it('returns a Wrapper matching tag selector passed', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('p').vnode).to.be.an('object')
  })

  it('returns Wrapper matching class selector passed', () => {
    const compiled = compileToFunctions('<div><div class="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('.foo').vnode).to.be.an('object')
  })

  it('returns Wrapper matching class selector passed if nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div /></transition>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('div').vnode).to.be.an('object')
  })

  it('returns an array of Wrapper of elements matching class selector passed if they are declared inside a slot', () => {
    const wrapper = mountingMethod(ComponentWithSlots, {
      slots: {
        default: '<div class="foo"></div>'
      }
    })
    expect(wrapper.find('.foo').vnode).to.be.an('object')
  })

  it('returns Wrapper matching class selector passed if they are declared inside a functional component', () => {
    const Component = {
      functional: true,
      render (h, { props }) {
        return h('div', {}, [
          h('p', {
            'class': {
              foo: true
            }
          }),
          h('p')
        ])
      },
      name: 'common'
    }
    const context = {
      data: { hello: true }
    }
    const wrapper = mountingMethod(Component, {
      context
    })
    expect(wrapper.find('.foo').vnode).to.be.an('object')
  })

  it('returns Wrapper of elements matching id selector passed', () => {
    const compiled = compileToFunctions('<div><div id="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('#foo').vnode).to.be.an('object')
  })

  it('returns Wrapper of elements matching attribute selector passed', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('[href="/"]').vnode).to.be.an('object')
  })

  it('throws an error when passed an invalid DOM selector', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const message = '[vue-test-utils]: wrapper.find() must be passed a valid CSS selector, Vue constructor, or valid find option object'
    const fn = () => wrapper.find('[href=&6"/"]')
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns Wrapper of elements matching selector when descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><li>list</li>item<li></li></ul></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('div li').vnode).to.be.an('object')
  })

  it('returns Wrapper of elements matching selector with direct descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><ul></ul></ul></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('div > ul').vnode).to.be.an('object')
  })

  it('returns Wrapper of elements matching pseudo selector', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('p:first-of-type').vnode).to.be.an('object')
  })

  it('returns Wrapper of Vue Components matching component', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.find(Component).vnode).to.be.an('object')
  })

  it('returns Wrapper of class component', () => {
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
    expect(wrapper.find(ComponentAsAClass).vnode).to.be.an('object')
  })

  it('returns Wrapper of Vue Component matching functional component', () => {
    if (!functionalSFCsSupported()) {
      return
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
    expect(wrapper.find(FunctionalComponent).vnode).to.be.an('object')
    expect(wrapper.find(FunctionalComponent).vm).to.equal(undefined)
  })

  it('returns Wrapper of Vue Component matching functional component with name', () => {
    const TestFunctionalComponent = {
      render: h => h('div'),
      functional: true,
      name: 'test-functional-component'
    }
    const TestComponent = {
      template: '<div><test-functional-component /></div>',
      components: {
        TestFunctionalComponent
      }
    }
    const wrapper = mountingMethod(TestComponent)
    if (vueVersion < 2.3) {
      const message = '[vue-test-utils]: find for functional components is not support in Vue < 2.3'
      const fn = () => wrapper.find(TestFunctionalComponent)
      expect(fn).to.throw().with.property('message', message)
    } else {
      expect(wrapper.find(TestFunctionalComponent).exists()).to.equal(true)
    }
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
    expect(wrapper.find('svg').find('svg').exists()).to.equal(true)
  })

  it('throws errror when searching for a component on an element Wrapper', () => {
    const TestComponent = {
      render (createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg></svg>'
          }
        })
      }
    }
    const fn = () => mountingMethod(TestComponent).find('svg').find(Component)
    const message = '[vue-test-utils]: cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?'
    expect(fn).to.throw().with.property('message', message)
  })

  it('throws errror when using ref selector on an element Wrapper', () => {
    const TestComponent = {
      render (createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg></svg>'
          }
        })
      }
    }
    const fn = () => mountingMethod(TestComponent).find('svg').find({ ref: 'some-ref' })
    const message = '[vue-test-utils]: cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?'
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns correct number of Vue Wrappers when component has a v-for', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = mountingMethod(ComponentWithVFor, { propsData: { items }})
    expect(wrapper.find(Component).vnode).to.be.an('object')
  })

  it('returns array of VueWrappers of Vue Components matching component if component name in parent is different to filename', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const div = wrapper.find('span')
    expect(div.find(Component).vnode).to.be.an('object')
  })

  it('returns Wrapper matching selector using Wrapper as reference', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const div = wrapper.find('span')
    expect(div.find(Component).vnode).to.be.an('object')
  })

  it('returns error Wrapper if Vue component is below Wrapper', () => {
    const AComponent = {
      render: () => {},
      name: 'a component'
    }
    const localVue = createLocalVue()
    localVue.component('a-component', AComponent)
    const TestComponent = {
      template: `
        <div>
          <span />
          <a-component />
        </div>
      `
    }
    const wrapper = mountingMethod(TestComponent, { localVue })
    const span = wrapper.find('span')
    expect(span.find(AComponent).exists()).to.equal(false)
  })

  it('returns empty Wrapper with error if no nodes are found', () => {
    const wrapper = mountingMethod(Component)
    const selector = 'pre'
    const error = wrapper.find(selector)
    expect(error.exists()).to.equal(false)
    expect(error.selector).to.equal(selector)
  })

  it('returns empty Wrapper with error if no nodes are found when passed a component', () => {
    const wrapper = mountingMethod(Component)
    const error = wrapper.find(ComponentWithChild)
    expect(error.exists()).to.equal(false)
    expect(error.selector).to.equal('Component')
  })

  it('returns Wrapper of elements matching the ref in options object', () => {
    const compiled = compileToFunctions('<div><p ref="foo"></p></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find({ ref: 'foo' })).to.be.an('object')
  })

  it('returns Wrapper of Vue Component matching the extended component', () => {
    const BaseComponent = {
      template: '<div><a-component /></div>',
      components: {
        AComponent: Component
      }
    }
    const TestComponent = {
      extends: BaseComponent,
      name: 'test-component'
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.find(TestComponent).exists()).to.equal(true)
    expect(wrapper.find(TestComponent).isVueComponent).to.equal(true)
  })

  it('returns a Wrapper matching a component name in options object', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.find({ name: 'component' }).name()).to.equal('component')
  })

  it('returns Wrapper of Vue Component matching the ref in options object', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.find({ ref: 'child' }).isVueComponent).to.equal(true)
  })

  it('throws an error when ref selector is called on a wrapper that is not a Vue component', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const a = wrapper.find('a')
    const message = '[vue-test-utils]: $ref selectors can only be used on Vue component wrappers'
    const fn = () => a.find({ ref: 'foo' })
    expect(fn).to.throw().with.property('message', message)
  })

  it('returns Wrapper matching ref selector in options object passed if nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div ref="foo"/></transition>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find({ ref: 'foo' })).to.be.an('object')
  })

  it('returns empty Wrapper with error if no nodes are found via ref in options object', () => {
    const wrapper = mountingMethod(Component)
    const error = wrapper.find({ ref: 'foo' })
    expect(error.exists()).to.equal(false)
    expect(error.selector).to.equal('ref="foo"')
  })

  it('returns Wrapper matching component that has no name property', () => {
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
    expect(wrapper.find(ComponentWithoutName).exists()).to.equal(true)
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = mountingMethod(Component)
    const invalidSelectors = [
      undefined, null, NaN, 0, 2, true, false, () => {}, {}, { name: undefined }, { ref: 'foo', nope: true }, []
    ]
    invalidSelectors.forEach((invalidSelector) => {
      const message = '[vue-test-utils]: wrapper.find() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      const fn = () => wrapper.find(invalidSelector)
      expect(fn).to.throw().with.property('message', message)
    })
  })
})
