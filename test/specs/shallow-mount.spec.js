import { compileToFunctions } from 'vue-template-compiler'
import Vue from 'vue'
import { mount, shallowMount } from '~vue/test-utils'
import Component from '~resources/components/component.vue'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithNestedChildren from '~resources/components/component-with-nested-children.vue'
import ComponentWithLifecycleHooks from '~resources/components/component-with-lifecycle-hooks.vue'
import ComponentWithoutName from '~resources/components/component-without-name.vue'
import ComponentAsAClassWithChild from '~resources/components/component-as-a-class-with-child.vue'
import RecursiveComponent from '~resources/components/recursive-component.vue'
import { vueVersion } from '~resources/utils'
import { describeRunIf, itDoNotRunIf } from 'conditional-specs'

describeRunIf(process.env.TEST_ENV !== 'node', 'shallowMount', () => {
  beforeEach(() => {
    sinon.stub(console, 'info')
    sinon.stub(console, 'error')
  })

  afterEach(() => {
    console.info.restore()
    console.error.restore()
  })

  it('returns new VueWrapper of Vue localVue if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = shallowMount(compiled)
    expect(wrapper.isVueInstance()).to.equal(true)
    expect(wrapper.vm).to.be.an('object')
  })

  it('returns new VueWrapper of Vue localVue with all children stubbed', () => {
    const wrapper = shallowMount(ComponentWithNestedChildren)
    expect(wrapper.isVueInstance()).to.equal(true)
    expect(wrapper.findAll(Component).length).to.equal(0)
    expect(wrapper.findAll(ComponentWithChild).length).to.equal(1)
  })

  it('returns new VueWrapper of Vue localVue with all children stubbed', () => {
    const wrapper = shallowMount(ComponentWithNestedChildren)
    expect(wrapper.isVueInstance()).to.equal(true)
    expect(wrapper.findAll(Component).length).to.equal(0)
    expect(wrapper.findAll(ComponentWithChild).length).to.equal(1)
  })

  it('does not modify component directly', () => {
    const wrapper = shallowMount(ComponentWithNestedChildren)
    expect(wrapper.findAll(Component).length).to.equal(0)
    const mountedWrapper = mount(ComponentWithNestedChildren)
    expect(mountedWrapper.findAll(Component).length).to.equal(1)
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

    expect(console.info.callCount).to.equal(4)
  })

  it('stubs globally registered components', () => {
    Vue.component('registered-component', ComponentWithLifecycleHooks)
    const Component = {
      render: h => h('registered-component')
    }
    shallowMount(Component)
    mount(Component)

    expect(console.info.callCount).to.equal(4)
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
      expect(console.error).not.called
    }
  )

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
    expect(wrapper.html()).to.contain('<test-component-stub>')
    expect(console.error).not.called
  })

  it('does not call stubbed children lifecycle hooks', () => {
    shallowMount(ComponentWithNestedChildren)
    expect(console.info.called).to.equal(false)
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
    expect(wrapper.find(ComponentWithPTag).exists()).to.equal(true)
    expect(wrapper.find('p').exists()).to.equal(false)
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
    expect(wrapper.find(ComponentWithPTag).exists()).to.equal(true)
    expect(wrapper.find('p').exists()).to.equal(false)
  })

  it('stubs Vue class component children', () => {
    if (vueVersion < 2.3) {
      return
    }
    const wrapper = shallowMount(ComponentAsAClassWithChild)
    expect(wrapper.find(Component).exists()).to.equal(true)
    expect(wrapper.findAll('div').length).to.equal(1)
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
    expect(wrapper.contains(ComponentWithoutName)).to.equal(true)
    expect(wrapper.find(ComponentWithoutName).exists()).to.equal(true)
    expect(wrapper.findAll(ComponentWithoutName).length).to.equal(1)
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
    expect(wrapper.contains(Component)).to.equal(true)
    expect(wrapper.find(Component).exists()).to.equal(true)
    expect(wrapper.findAll(Component).length).to.equal(1)
  })

  it('works correctly with find on recursive components', () => {
    // this is for a bug that I've been unable to replicate.
    // Sometimes components mutate their components, in this line—
    RecursiveComponent.components = {
      RecursiveComponent: { render: h => h('div') }
    }

    expect(
      shallowMount(RecursiveComponent, {
        propsData: {
          items: ['', '']
        }
      }).findAll(RecursiveComponent).length
    ).to.equal(3)
    RecursiveComponent.components = {
      'recursive-component': { render: h => h('div') }
    }
    expect(
      shallowMount(RecursiveComponent, {
        propsData: {
          items: ['', '']
        }
      }).findAll(RecursiveComponent).length
    ).to.equal(3)
  })

  it('throws an error when the component fails to mount', () => {
    expect(() =>
      shallowMount({
        template: '<div></div>',
        mounted: function () {
          throw new Error('Error')
        }
      })
    ).to.throw()
  })
})
