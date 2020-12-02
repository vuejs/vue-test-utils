import { compileToFunctions } from 'vue-template-compiler'
import Vue from 'vue'
import { mount, shallowMount, createLocalVue } from 'packages/test-utils/src'
import Component from '~resources/components/component.vue'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithFunctionalChild from '~resources/components/component-with-functional-child.vue'
import ComponentWithNestedChildren from '~resources/components/component-with-nested-children.vue'
import ComponentWithLifecycleHooks from '~resources/components/component-with-lifecycle-hooks.vue'
import ComponentWithoutName from '~resources/components/component-without-name.vue'
import ComponentAsAClassWithChild from '~resources/components/component-as-a-class-with-child.vue'
import ComponentWithVSlotSyntax from '~resources/components/component-with-v-slot-syntax.vue'
import ComponentWithVSlot from '~resources/components/component-with-v-slot.vue'
import RecursiveComponent from '~resources/components/recursive-component.vue'
import { vueVersion } from '~resources/utils'
import { describeRunIf, itDoNotRunIf } from 'conditional-specs'

describeRunIf(process.env.TEST_ENV !== 'node', 'shallowMount', () => {
  let consoleInfoSave = console.info
  let consoleErrorSave = console.error

  beforeEach(() => {
    consoleInfoSave = console.info
    consoleErrorSave = console.error
    console.info = jest.fn()
    console.error = jest.fn()
  })

  afterEach(() => {
    console.info = consoleInfoSave
    console.error = consoleErrorSave
  })

  it('renders dynamic class of functional child', () => {
    const wrapper = shallowMount(ComponentWithFunctionalChild)
    expect(wrapper.find('functional-component-stub').classes()).toContain(
      'baz',
      'foo',
      'bar'
    )
    expect(wrapper.find('functional-component-stub').classes()).not.toContain(
      'qux'
    )
  })

  it('renders v-text content of functional child', () => {
    const wrapper = shallowMount(ComponentWithFunctionalChild)
    expect(wrapper.find('functional-component-stub').text()).toBe('value')
  })

  it('trigger click must change content of functional child', async () => {
    const wrapper = shallowMount(ComponentWithFunctionalChild)

    await wrapper.trigger('click')

    expect(wrapper.find('functional-component-stub').text()).toBe('newValue')
  })

  it('returns new VueWrapper of Vue localVue if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = shallowMount(compiled)
    expect(wrapper.isVueInstance()).toEqual(true)
    expect(wrapper.vm).toBeTruthy()
  })

  it('returns new VueWrapper with all children stubbed', () => {
    const wrapper = shallowMount(ComponentWithNestedChildren)
    expect(wrapper.isVueInstance()).toEqual(true)
    expect(wrapper.findAll(Component).length).toEqual(0)
    expect(wrapper.findAll(ComponentWithChild).length).toEqual(1)
  })

  it('does not modify component directly', () => {
    const wrapper = shallowMount(ComponentWithNestedChildren)
    expect(wrapper.findAll(Component).length).toEqual(0)
    const mountedWrapper = mount(ComponentWithNestedChildren)

    expect(mountedWrapper.findAll(Component).length).toEqual(1)
  })

  it('stubs globally registered components when options.localVue is provided', () => {
    const localVue = Vue.extend()
    localVue.component('registered-component', ComponentWithLifecycleHooks)
    const TestComponent = {
      render: h => h('registered-component')
    }
    shallowMount(TestComponent, { localVue })
    localVue.component('registered-component', ComponentWithLifecycleHooks)
    mount(TestComponent, { localVue })

    expect(console.info).toHaveBeenCalledTimes(4)
  })

  it('renders children', () => {
    const localVue = createLocalVue()
    localVue.component('child', {
      template: '<div />'
    })
    const TestComponent = {
      template: `<child>{{'Hello'}}</child>`
    }
    const wrapper = shallowMount(TestComponent, {
      localVue
    })
    expect(wrapper.html()).toEqual('<child-stub>Hello</child-stub>')
  })

  it('renders named slots', () => {
    const localVue = createLocalVue()
    localVue.component('child', {
      template: '<div />'
    })
    const TestComponent = {
      template: `
        <child>
          <p slot="header">Hello</p>
          <p slot="footer">World</p>
        </child>
      `
    }
    const wrapper = shallowMount(TestComponent, {
      localVue
    })
    expect(wrapper.html()).toEqual(
      '<child-stub>\n' +
        '  <p>Hello</p>\n' +
        '  <p>World</p>\n' +
        '</child-stub>'
    )
  })

  it('renders SFC with named slots with v-slot syntax', () => {
    const wrapper = shallowMount(ComponentWithVSlotSyntax)

    expect(wrapper.find(ComponentWithVSlot).exists()).toEqual(true)
    expect(wrapper.find('.new-example').exists()).toEqual(true)
    expect(wrapper.html()).toEqual(
      '<componentwithvslot-stub>\n' +
        '  <p class="new-example">new slot syntax</p>\n' +
        '</componentwithvslot-stub>'
    )
  })

  it('renders named slots with v-slot syntax', () => {
    const localVue = createLocalVue()
    localVue.component('Foo', {
      template: '<div><slot name="newSyntax" /></div>'
    })
    const TestComponent = {
      template: `
        <Foo>
          <template v-slot:newSyntax>
            <p class="new-example">text</p>
          </template>
        </Foo>
      `
    }
    const wrapper = shallowMount(TestComponent, {
      localVue
    })
    expect(wrapper.find({ name: 'Foo' }).exists()).toEqual(true)
    expect(wrapper.find('.new-example').exists()).toEqual(true)
    expect(wrapper.html()).toEqual(
      '<foo-stub>\n' + '  <p class="new-example">text</p>\n' + '</foo-stub>'
    )
  })

  it('renders named slots when they are located inside component with v-if', () => {
    const localVue = createLocalVue()
    localVue.component('Foo', {
      template: '<div><slot name="newSyntax" /></div>'
    })
    const TestComponent = {
      template: `
        <Foo v-if="true">
          <template v-slot:newSyntax>
            <p class="new-example">text</p>
          </template>
        </Foo>
      `
    }
    const wrapper = shallowMount(TestComponent, {
      localVue
    })
    expect(wrapper.find({ name: 'Foo' }).exists()).toEqual(true)
    expect(wrapper.find('.new-example').exists()).toEqual(true)
    expect(wrapper.html()).toEqual(
      '<foo-stub>\n' + '  <p class="new-example">text</p>\n' + '</foo-stub>'
    )
  })

  it('renders no children if none supplied', () => {
    const TestComponent = {
      template: '<child />',
      components: { Child: {} }
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.html()).toEqual('<child-stub></child-stub>')
  })

  it('renders children for functional components', () => {
    const localVue = createLocalVue()
    localVue.component('child', {
      template: '<div />',
      functional: true
    })
    const TestComponent = {
      template: `<child>{{'Hello'}}</child>`
    }
    const wrapper = shallowMount(TestComponent, {
      localVue
    })
    expect(wrapper.html()).toEqual('<child-stub>Hello</child-stub>')
  })

  it('stubs globally registered components', () => {
    Vue.component('registered-component', ComponentWithLifecycleHooks)
    const Component = {
      render: h => h('registered-component')
    }
    shallowMount(Component)
    mount(Component)

    expect(console.info).toHaveBeenCalledTimes(4)
  })

  itDoNotRunIf(
    vueVersion < 2.1,
    'adds stubbed components to ignored elements',
    () => {
      const TestComponent = {
        template: `
          <div>
            <router-link>
            </router-link>
            <custom-component />
          </div>
        `,
        components: {
          'router-link': {
            template: '<div/>'
          },
          'custom-component': {
            template: '<div/>'
          }
        }
      }
      shallowMount(TestComponent)
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringMatching('[Vue warn]')
      )
    }
  )

  itDoNotRunIf(
    vueVersion < 2.2, // $props does not exist in Vue < 2.2
    'renders stubs props',
    () => {
      const TestComponent = {
        template: `<child :prop="propA" attr="hello" />`,
        data: () => ({
          propA: 'a'
        }),
        components: {
          child: {
            props: ['prop']
          }
        }
      }
      const wrapper = shallowMount(TestComponent)
      expect(wrapper.html()).toContain('<child-stub prop="a" attr="hello"')
    }
  )

  itDoNotRunIf(
    vueVersion < 2.2, // $props does not exist in Vue < 2.2
    'renders stubs classes',
    () => {
      const TestComponent = {
        template: `<child :class="classA" class="b" />`,
        data: () => ({
          classA: 'a'
        }),
        components: {
          child: { template: '<div />' }
        }
      }
      const wrapper = shallowMount(TestComponent)
      expect(wrapper.html()).toContain('<child-stub class="b a"')
    }
  )

  it('renders stubs props for functional components', () => {
    const TestComponent = {
      template: `<child :prop="propA" attr="hello" />`,
      data: () => ({
        propA: 'a'
      }),
      components: {
        Child: {
          props: ['prop'],
          functional: true
        }
      }
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.html()).toContain('<child-stub prop="a" attr="hello"')
  })

  it('renders classes for functional components', () => {
    const components = {
      Child: {
        functional: true
      }
    }
    const TestComponent = {
      template: `<child :class="classA" class="b" />`,
      data: () => ({
        classA: 'a'
      }),
      components
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.html()).toContain('<child-stub class="b a"')
    const TestComponent2 = {
      template: `<child :class="classA"/>`,
      data: () => ({
        classA: 'a'
      }),
      components
    }
    const wrapper2 = shallowMount(TestComponent2)
    expect(wrapper2.html()).toContain('<child-stub class="a"')
    const TestComponent3 = {
      template: `<child class="b" />`,
      data: () => ({
        classA: 'a'
      }),
      components
    }
    const wrapper3 = shallowMount(TestComponent3)
    expect(wrapper3.html()).toContain('<child-stub class="b"')
  })

  itDoNotRunIf(vueVersion < 2.1, 'handles recursive components', () => {
    const TestComponent = {
      template: `
          <div>
            <test-component />
          </div>
        `,
      name: 'test-component'
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.html()).toContain('<test-component-stub>')
    expect(console.error).not.toHaveBeenCalledWith(
      expect.stringMatching('[Vue warn]')
    )
  })

  it('does not call stubbed children lifecycle hooks', () => {
    shallowMount(ComponentWithNestedChildren)
    expect(console.info).not.toHaveBeenCalled()
  })

  it('stubs extended components', () => {
    const ComponentWithPTag = {
      template: `<p></p>`
    }
    const BaseComponent = {
      template: `
        <div>
          <component-with-p-tag />
        </div>
      `,
      components: {
        ComponentWithPTag
      }
    }

    const TestComponent = {
      extends: BaseComponent
    }

    const wrapper = shallowMount(TestComponent)
    expect(wrapper.find(ComponentWithPTag).exists()).toEqual(true)
    expect(wrapper.find('p').exists()).toEqual(false)
  })

  it('stubs nested extended components', () => {
    const ComponentWithPTag = {
      template: `<p></p>`
    }
    const BaseComponent = {
      template: `
        <div>
          <component-with-p-tag />
        </div>
      `,
      components: {
        ComponentWithPTag
      }
    }

    const ExtendedBaseComponent = {
      extends: BaseComponent
    }

    const TestComponent = {
      extends: ExtendedBaseComponent
    }

    const wrapper = shallowMount(TestComponent)
    expect(wrapper.find(ComponentWithPTag).exists()).toEqual(true)
    expect(wrapper.find('p').exists()).toEqual(false)
  })

  it('stubs components that receive props through mixin', () => {
    const addProps = {
      props: ['a']
    }

    const ChildComponent = {
      template: '<div />',
      mixins: [addProps]
    }

    const ChildComponentExtended = Vue.extend({
      template: '<div />',
      mixins: [addProps]
    })

    const TestComponent = {
      template: `
        <div>
          <child-component a="val" />
          <child-component-extended a="val" />
        </div>
      `,
      components: {
        ChildComponent,
        ChildComponentExtended
      }
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.find(ChildComponent).props('a')).toEqual('val')
    expect(wrapper.find(ChildComponentExtended).props('a')).toEqual('val')
  })

  itDoNotRunIf(vueVersion < 2.3, 'stubs Vue class component children', () => {
    const wrapper = shallowMount(ComponentAsAClassWithChild)
    expect(wrapper.find(Component).exists()).toEqual(true)
    expect(wrapper.findAll('div').length).toEqual(1)
  })

  it('works correctly with find, contains, findAll, and is on unnamed components', () => {
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
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.contains(ComponentWithoutName)).toEqual(true)
    expect(wrapper.find(ComponentWithoutName).exists()).toEqual(true)
    expect(wrapper.findAll(ComponentWithoutName).length).toEqual(1)
  })

  it('works correctly with find, contains, findAll, and is on named components', () => {
    const TestComponent = {
      template: `
        <div>
            <a-component />
        </div>
      `,
      components: {
        AComponent: Component
      }
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.contains(Component)).toEqual(true)
    expect(wrapper.find(Component).exists()).toEqual(true)
    expect(wrapper.findAll(Component).length).toEqual(1)
  })

  it('works correctly with find on recursive components', () => {
    // this is for a bug that I've been unable to replicate.
    // Sometimes components mutate their components, in this line—
    const wrapper = shallowMount(RecursiveComponent, {
      propsData: {
        items: ['', '']
      }
    })

    expect(wrapper.findAll(RecursiveComponent).length).toEqual(3)
  })

  itDoNotRunIf(vueVersion < 2.4, 'handles extended stubs', () => {
    const ChildComponent = Vue.extend({
      template: '<div />',
      props: ['propA']
    })
    const TestComponent = {
      template: '<child-component propA="hey" />',
      components: { ChildComponent }
    }
    const wrapper = shallowMount(TestComponent, {
      stubs: ['child-component']
    })

    expect(wrapper.find(ChildComponent).vm.propA).toEqual('hey')
  })

  it('does not stub unregistered components', () => {
    const TestComponent = {
      template: '<custom-element />'
    }
    const wrapper = shallowMount(TestComponent)

    expect(wrapper.html()).toEqual('<custom-element></custom-element>')
  })

  it('stubs lazily registered components', () => {
    const Child = {
      render: h => h('p')
    }
    const TestComponent = {
      template: '<div><child /></div>',
      beforeCreate() {
        this.$options.components.Child = Child
      }
    }
    const wrapper = shallowMount(TestComponent)

    expect(wrapper.findAll('p').length).toEqual(0)
    expect(wrapper.findAll(Child).length).toEqual(1)
  })

  itDoNotRunIf(
    vueVersion < 2.4, // auto resolve of default export added in 2.4
    'handles component as dynamic import',
    () => {
      const TestComponent = {
        template: '<div><async-component /></div>',
        components: {
          AsyncComponent: () => import('~resources/components/component.vue')
        }
      }
      shallowMount(TestComponent)
    }
  )

  it('stubs components registered on localVue after multiple installs', () => {
    const myPlugin = function(_Vue, opts) {
      _Vue.mixin({})
    }
    const localVue = createLocalVue()
    localVue.component('registered-component', {
      render: h => h('time')
    })
    const TestComponent = {
      render: h => h('registered-component')
    }

    localVue.use(myPlugin)
    const wrapper = shallowMount(TestComponent, { localVue })
    expect(wrapper.html()).toContain('registered-component-stub')
  })

  it('throws an error when the component fails to mount', () => {
    expect(() =>
      shallowMount({
        template: '<div></div>',
        mounted: function() {
          throw new Error('Error')
        }
      })
    ).toThrow()
  })

  it('stubs dynamic components', () => {
    const ChildComponent = {
      template: '<div />'
    }
    const TestComponent = {
      template: `
      <div>
        <ChildComponent />
        <component :is="dataComponent" />
        <component :is="computedComponent" />
        <component :is="methodComponent()" />
      </div>
      `,
      components: { ChildComponent },

      data() {
        return {
          dataComponent: ChildComponent
        }
      },

      computed: {
        computedComponent() {
          return ChildComponent
        }
      },

      methods: {
        methodComponent() {
          return ChildComponent
        }
      }
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.html()).toEqual(
      '<div>\n' +
        '  <childcomponent-stub></childcomponent-stub>\n' +
        '  <anonymous-stub></anonymous-stub>\n' +
        '  <anonymous-stub></anonymous-stub>\n' +
        '  <anonymous-stub></anonymous-stub>\n' +
        '</div>'
    )
  })

  itDoNotRunIf(
    vueVersion < 2.1,
    'does not error when rendering a previously stubbed component',
    () => {
      const ChildComponent = {
        render: h => h('div')
      }
      const TestComponent = {
        template: `
        <div>
          <extended-component />
          <keep-alive>
            <child-component />
          </keep-alive>
        </div>
      `,
        components: {
          ExtendedComponent: Vue.extend({ render: h => h('div') }),
          ChildComponent
        }
      }
      shallowMount(TestComponent)
      mount(TestComponent)
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringMatching('Unknown custom element')
      )
    }
  )

  itDoNotRunIf(vueVersion < 2.2, 'stubs model', () => {
    const ChildComponent = {
      template: '<div />',
      model: {
        prop: 'a',
        event: 'change'
      },
      props: ['a']
    }
    const TestComponent = {
      template: '<child-component v-model="val" />',
      data() {
        return {
          val: '123'
        }
      },
      components: { ChildComponent }
    }
    const wrapper = shallowMount(TestComponent)
    expect(wrapper.find(ChildComponent).vm.a).toEqual('123')
  })
})
