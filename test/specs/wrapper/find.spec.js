import { compileToFunctions } from 'vue-template-compiler'
import { createLocalVue, shallowMount } from 'packages/test-utils/src'
import Vue from 'vue'
import VueRouter from 'vue-router'
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
  describeWithShallowAndMount,
  isRunningChrome
} from '~resources/utils'
import { itDoNotRunIf, itSkipIf } from 'conditional-specs'

describeWithShallowAndMount('find', mountingMethod => {
  itDoNotRunIf(
    mountingMethod.name === 'shallowMount' || vueVersion < 2.6,
    'returns a VueWrapper using a <router-view /> component',
    async () => {
      const localVue = createLocalVue()
      localVue.use(VueRouter)
      const TestComponentToFind = {
        render: h => h('div'),
        name: 'test-component-to-find'
      }
      const routes = [
        {
          path: '/a/b',
          name: 'ab',
          component: TestComponentToFind
        }
      ]
      const router = new VueRouter({ routes })
      const wrapper = mountingMethod(
        {
          template: '<router-view/>'
        },
        {
          localVue,
          router
        }
      )

      await router.push('/a/b')

      expect(wrapper.findComponent(TestComponentToFind).exists()).toBe(true)
    }
  )

  it('findComponent in functional component', () => {
    const Comp2 = {
      name: 'test',
      render(h) {
        return h('div', 'test')
      }
    }
    const Comp = {
      name: 'Comp',
      functional: true,
      render(h) {
        return h(Comp2)
      }
    }
    const wrapper = shallowMount(Comp)
    wrapper.getComponent(Comp2)
  })

  it('returns a Wrapper matching tag selector passed', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('p').vnode).toBeTruthy()
    expect(wrapper.find('p').vm).toEqual(undefined)
  })

  it('returns Wrapper matching class selector passed', () => {
    const compiled = compileToFunctions('<div><div class="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('.foo').vnode).toBeTruthy()
    expect(wrapper.find('.foo').vm).toEqual(undefined)
  })

  it('returns Wrapper matching class selector passed if nested in a transition', () => {
    const compiled = compileToFunctions('<transition><div /></transition>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('div').vnode).toBeTruthy()
  })

  itDoNotRunIf(
    isRunningChrome,
    'returns an array of Wrapper of elements matching class selector passed if they are declared inside a slot',
    () => {
      const wrapper = mountingMethod(ComponentWithSlots, {
        slots: {
          default: '<div class="foo"></div>'
        }
      })
      expect(wrapper.find('.foo').vnode).toBeTruthy()
    }
  )

  it('returns Wrapper matching class selector passed if they are declared inside a functional component', () => {
    const TestComponent = {
      functional: true,
      render(h, { props }) {
        return h('div', {}, [
          h('p', {
            class: {
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
    const wrapper = mountingMethod(TestComponent, {
      context
    })
    expect(wrapper.find('.foo').vnode).toBeTruthy()
  })

  it('returns Wrapper of elements matching id selector passed', () => {
    const compiled = compileToFunctions('<div><div id="foo" /></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('#foo').vnode).toBeTruthy()
  })

  it('returns matching extended component', () => {
    const ChildComponent = Vue.extend({
      template: '<div />',
      props: ['propA'],
      name: 'child-component'
    })
    const TestComponent = {
      template: '<child-component propA="hey" />',
      components: { ChildComponent }
    }
    const wrapper = mountingMethod(TestComponent)

    expect(wrapper.find(ChildComponent).name()).toEqual('child-component')
  })

  it('returns Wrapper of elements matching attribute selector passed', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('[href="/"]').vnode).toBeTruthy()
  })

  it('throws an error when passed an invalid DOM selector', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const message =
      '[vue-test-utils]: wrapper.find() must be passed a valid CSS selector, Vue constructor, or valid find option object'
    const fn = () => wrapper.find('[href=&6"/"]')
    expect(fn).toThrow(message)
  })

  it('returns Wrapper of elements matching selector when descendant combinator passed', () => {
    const compiled = compileToFunctions(
      '<div><ul><li>list</li>item<li></li></ul></div>'
    )
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('div li').vnode).toBeTruthy()
  })

  it('returns Wrapper of elements matching selector with direct descendant combinator passed', () => {
    const compiled = compileToFunctions('<div><ul><ul></ul></ul></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('div > ul').vnode).toBeTruthy()
  })

  it('returns Wrapper of elements matching pseudo selector', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find('p:first-of-type').vnode).toBeTruthy()
  })

  it('returns Wrapper of Vue Components matching component', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.find(Component).vnode).toBeTruthy()
  })

  it('returns Wrapper of Vue Components matching component using findComponent', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.findComponent(Component).vnode).toBeTruthy()
  })

  it('throws an error if findComponent selector is a CSS selector', () => {
    const wrapper = mountingMethod(Component)
    const message =
      '[vue-test-utils]: findComponent requires a Vue constructor or valid find object. If you are searching for DOM nodes, use `find` instead'
    const fn = () => wrapper.findComponent('#foo')
    expect(fn).toThrow(message)
  })

  it('throws an error if findComponent is chained off a DOM element', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const message =
      '[vue-test-utils]: You cannot chain findComponent off a DOM element. It can only be used on Vue Components.'
    const fn = () => wrapper.find('span').findComponent('#foo')
    expect(fn).toThrow(message)
  })

  it('allows using findComponent on functional component', () => {
    const FuncComponentWithChildren = {
      functional: true,
      components: {
        ChildComponent: Component
      },
      render: h => h('div', {}, [h(Component)])
    }
    const wrapper = mountingMethod(FuncComponentWithChildren)
    expect(wrapper.findComponent(Component).exists()).toBe(true)
  })

  itSkipIf(isRunningChrome, 'returns Wrapper of class component', () => {
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

    expect(wrapper.find(ComponentAsAClass).vnode).toBeTruthy()
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'follows DOM tree order',
    () => {
      const TestComponent = {
        template: `
      <main>
        <div class="1">
          <div class="1a"><div class="1aa"/></div><div class="1b" />
        </div>
        <component-2 />
        <div class="3" />
      </main>
      `,
        components: {
          'component-2': {
            template: '<div class="2" />'
          }
        }
      }
      const wrapper = mountingMethod(TestComponent)
      const wrappers = wrapper.findAll('div').wrappers
      const expectedClasses = ['1', '1a', '1aa', '1b', '2', '3']
      wrappers.forEach((w, i) =>
        expect(w.classes()).toContain(expectedClasses[i])
      )
    }
  )

  it('returns functional component', () => {
    if (!functionalSFCsSupported) {
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

    expect(wrapper.find(FunctionalComponent).vnode).toBeTruthy()
    expect(wrapper.find(FunctionalComponent).vm).toEqual(undefined)
  })

  it('returns functional component with name', () => {
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
      const message =
        '[vue-test-utils]: find for functional components is not supported in Vue < 2.3'
      const fn = () => wrapper.find(TestFunctionalComponent)
      expect(fn).toThrow(message)
    } else {
      expect(wrapper.find(TestFunctionalComponent).exists()).toEqual(true)
    }
  })

  itSkipIf(
    vueVersion < 2.3,
    'returns functional component with name by name',
    () => {
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
      expect(
        wrapper.find({ name: 'test-functional-component' }).exists()
      ).toEqual(true)
    }
  )

  it('returns extended functional component', () => {
    const TestFunctionalComponent = Vue.extend({
      render: h => h('div'),
      functional: true
    })
    const TestComponent = {
      template: '<div><test-functional-component /></div>',
      components: {
        TestFunctionalComponent
      }
    }
    const wrapper = mountingMethod(TestComponent)
    if (vueVersion < 2.3) {
      const message =
        '[vue-test-utils]: find for functional components is not supported in Vue < 2.3'
      const fn = () => wrapper.find(TestFunctionalComponent)
      expect(fn).toThrow(message)
    } else {
      expect(wrapper.find(TestFunctionalComponent).exists()).toEqual(true)
    }
  })

  it('works correctly with innerHTML', () => {
    const TestComponent = {
      render(createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg></svg>'
          }
        })
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(
      wrapper
        .find('svg')
        .find('svg')
        .exists()
    ).toEqual(true)
  })

  it('throws errror when searching for a component on an element Wrapper', () => {
    const TestComponent = {
      render(createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg></svg>'
          }
        })
      }
    }
    const fn = () =>
      mountingMethod(TestComponent)
        .find('svg')
        .find(Component)
    const message =
      '[vue-test-utils]: cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?'
    expect(fn).toThrow(message)
  })

  it('throws errror when using ref selector on an element Wrapper', () => {
    const TestComponent = {
      render(createElement) {
        return createElement('div', {
          domProps: {
            innerHTML: '<svg></svg>'
          }
        })
      }
    }
    const fn = () =>
      mountingMethod(TestComponent)
        .find('svg')
        .find({ ref: 'some-ref' })
    const message =
      '[vue-test-utils]: cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?'
    expect(fn).toThrow(message)
  })

  it('returns correct number of Vue Wrappers when component has a v-for', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const wrapper = mountingMethod(ComponentWithVFor, { propsData: { items } })
    expect(wrapper.find(Component).vnode).toBeTruthy()
  })

  it('returns Wrapper matching selector using Wrapper as reference', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const div = wrapper.find('span')
    expect(div.find(Component).vnode).toBeTruthy()
  })

  it('selector works between mounts', () => {
    const ChildComponent = { template: '<div />' }
    const TestComponent = {
      template: '<child-component />',
      components: {
        ChildComponent
      }
    }
    const wrapper = mountingMethod(TestComponent)
    mountingMethod(ChildComponent)
    expect(wrapper.find(ChildComponent).vnode).toBeTruthy()
  })

  it('returns error Wrapper if Vue component is below Wrapper', () => {
    const AComponent = {
      render: () => {},
      name: 'a-component'
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
    expect(span.find(AComponent).exists()).toEqual(false)
  })

  it('returns empty Wrapper with error if no nodes are found', () => {
    const wrapper = mountingMethod(Component)
    const selector = 'pre'
    const error = wrapper.find(selector)
    expect(error.exists()).toEqual(false)
    expect(error.selector).toEqual(selector)
  })

  it('returns empty Wrapper with error if no nodes are found when passed a component', () => {
    const wrapper = mountingMethod(Component)
    const error = wrapper.find(ComponentWithChild)
    expect(error.exists()).toEqual(false)
    expect(error.selector).toEqual(ComponentWithChild)
  })

  it('returns Wrapper of elements matching the ref in options object', () => {
    const compiled = compileToFunctions('<div><p ref="foo"></p></div>')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find({ ref: 'foo' })).toBeTruthy()
  })

  itSkipIf(vueVersion < 2.3, 'returns functional extended component', () => {
    const FunctionalExtendedComponent = Vue.extend({
      functional: true,
      render: h => h('div')
    })
    const TestComponent = {
      template: '<div><functional-extended-component /></div>',
      components: {
        FunctionalExtendedComponent
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.find(FunctionalExtendedComponent).exists()).toEqual(true)
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
    expect(wrapper.find(TestComponent).exists()).toEqual(true)
    expect(wrapper.find(TestComponent).isVueInstance()).toEqual(true)
  })

  it('works for extended child components', () => {
    const ChildComponent = Vue.extend({
      template: '<div />'
    })
    const TestComponent = {
      template: '<child-component />',
      components: {
        ChildComponent
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.find(ChildComponent).exists()).toEqual(true)
  })

  it('returns a Wrapper matching a component name in options object', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.find({ name: 'test-component' }).name()).toEqual(
      'test-component'
    )
  })

  it('returns a Wrapper matching a camelCase name option and a Pascal Case component name ', () => {
    const component = {
      name: 'CamelCase',
      render: h => h('div')
    }
    const wrapper = mountingMethod(component)
    expect(wrapper.find({ name: 'camelCase' }).name()).toEqual('CamelCase')
  })

  it('returns a Wrapper matching a kebab-case name option and a Pascal Case component name ', () => {
    const component = {
      name: 'CamelCase',
      render: h => h('div')
    }
    const wrapper = mountingMethod(component)
    expect(wrapper.find({ name: 'camel-case' }).name()).toEqual('CamelCase')
  })

  it('returns a Wrapper matching a Pascal Case name option and a kebab-casecomponent name ', () => {
    const component = {
      name: 'camel-case',
      render: h => h('div')
    }
    const wrapper = mountingMethod(component)
    expect(wrapper.find({ name: 'CamelCase' }).name()).toEqual('camel-case')
  })

  it('returns Wrapper of Vue Component matching the ref in options object', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    expect(wrapper.find({ ref: 'child' }).isVueInstance()).toEqual(true)
  })

  it('throws an error when ref selector is called on a wrapper that is not a Vue component', () => {
    const compiled = compileToFunctions('<div><a href="/"></a></div>')
    const wrapper = mountingMethod(compiled)
    const a = wrapper.find('a')
    const message =
      '[vue-test-utils]: $ref selectors can only be used on Vue component wrappers'
    const fn = () => a.find({ ref: 'foo' })
    expect(fn).toThrow(message)
  })

  it('returns Wrapper matching ref selector in options object passed if nested in a transition', () => {
    const compiled = compileToFunctions(
      '<transition><div ref="foo"/></transition>'
    )
    const wrapper = mountingMethod(compiled)
    expect(wrapper.find({ ref: 'foo' })).toBeTruthy()
  })

  it('returns empty Wrapper with error if no nodes are found via ref in options object', () => {
    const wrapper = mountingMethod(Component)
    const selector = { ref: 'foo' }
    const error = wrapper.find(selector)
    expect(error.exists()).toEqual(false)
    expect(error.selector).toEqual(selector)
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
    expect(wrapper.find(ComponentWithoutName).exists()).toEqual(true)
  })

  it('throws an error if selector is not a valid selector', () => {
    const wrapper = mountingMethod(Component)
    const invalidSelectors = [
      undefined,
      null,
      NaN,
      0,
      2,
      true,
      false,
      () => {},
      {},
      { name: undefined },
      { ref: 'foo', nope: true },
      []
    ]
    invalidSelectors.forEach(invalidSelector => {
      const message =
        '[vue-test-utils]: wrapper.find() must be passed a valid CSS selector, Vue constructor, or valid find option object'
      const fn = () => wrapper.find(invalidSelector)
      expect(fn).toThrow(message)
    })
  })

  it('handles unnamed components', async () => {
    const ChildComponent = {
      template: '<div />'
    }
    const TestComponent = {
      template: '<child-component v-if="renderChild" />',
      components: { ChildComponent },
      data: function() {
        return {
          renderChild: false
        }
      }
    }
    const wrapper = mountingMethod(TestComponent)

    expect(wrapper.find(ChildComponent).vnode).toBeUndefined()
    wrapper.vm.renderChild = true
    await Vue.nextTick()
    expect(wrapper.find(ChildComponent).vnode).toBeTruthy()
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'returns a VueWrapper instance by CSS selector if the element binds a Vue instance',
    () => {
      const childComponent = {
        name: 'bar',
        template: '<p/>'
      }
      const wrapper = mountingMethod({
        name: 'foo',
        template: '<div><child-component /></div>',
        components: { childComponent }
      })
      expect(wrapper.find('div').vm.$options.name).toEqual('foo')
      expect(wrapper.find('p').vm.$options.name).toEqual('bar')
    }
  )

  it('stores CSS selector', () => {
    const compiled = compileToFunctions('<div><p></p><p></p></div>')
    const wrapper = mountingMethod(compiled)
    const selector = 'p'
    const result = wrapper.find(selector)
    expect(result.selector).toEqual(selector)
  })

  it('stores ref selector', () => {
    const compiled = compileToFunctions('<div><p ref="foo"></p></div>')
    const wrapper = mountingMethod(compiled)
    const selector = { ref: 'foo' }
    const result = wrapper.find(selector)
    expect(result.selector).toEqual(selector)
  })

  it('stores component selector', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const selector = Component
    const result = wrapper.find(selector)
    expect(result.selector).toEqual(selector)
  })

  it('stores name selector', () => {
    const wrapper = mountingMethod(ComponentWithChild)
    const selector = { name: 'test-component' }
    const result = wrapper.find(selector)
    expect(result.selector).toEqual(selector)
  })
})
