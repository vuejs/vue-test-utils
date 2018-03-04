import { compileToFunctions } from 'vue-template-compiler'
import Vue from 'vue'
import { mount, shallow } from '~vue/test-utils'
import Component from '~resources/components/component.vue'
import ComponentWithChild from '~resources/components/component-with-child.vue'
import ComponentWithNestedChildren from '~resources/components/component-with-nested-children.vue'
import ComponentWithLifecycleHooks from '~resources/components/component-with-lifecycle-hooks.vue'
import ComponentWithoutName from '~resources/components/component-without-name.vue'
import ComponentAsAClassWithChild from '~resources/components/component-as-a-class-with-child.vue'
import RecursiveComponent from '~resources/components/recursive-component.vue'
import { vueVersion } from '~resources/utils'

describe('shallow', () => {
  let info

  beforeEach(() => {
    info = sinon.stub(console, 'info')
  })

  afterEach(() => {
    info.restore()
  })

  it('returns new VueWrapper of Vue localVue if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = shallow(compiled)
    expect(wrapper.isVueComponent).to.equal(true)
    expect(wrapper.vm).to.be.an('object')
  })

  it('returns new VueWrapper of Vue localVue with all children stubbed', () => {
    const wrapper = shallow(ComponentWithNestedChildren)
    expect(wrapper.isVueComponent).to.equal(true)
    expect(wrapper.findAll(Component).length).to.equal(0)
    expect(wrapper.findAll(ComponentWithChild).length).to.equal(1)
  })

  it('returns new VueWrapper of Vue localVue with all children stubbed', () => {
    const wrapper = shallow(ComponentWithNestedChildren)
    expect(wrapper.isVueComponent).to.equal(true)
    expect(wrapper.findAll(Component).length).to.equal(0)
    expect(wrapper.findAll(ComponentWithChild).length).to.equal(1)
  })

  it('does not modify component directly', () => {
    const wrapper = shallow(ComponentWithNestedChildren)
    expect(wrapper.findAll(Component).length).to.equal(0)
    const mountedWrapper = mount(ComponentWithNestedChildren)
    expect(mountedWrapper.findAll(Component).length).to.equal(1)
  })

  it('stubs globally registered components when options.localVue is provided', () => {
    const localVue = Vue.extend()
    localVue.component('registered-component', ComponentWithLifecycleHooks)
    const Component = {
      render: h => h('registered-component')
    }
    shallow(Component, { localVue })
    mount(Component, { localVue })

    expect(info.callCount).to.equal(4)
  })

  it('stubs globally registered components', () => {
    Vue.component('registered-component', ComponentWithLifecycleHooks)
    const Component = {
      render: h => h('registered-component')
    }
    shallow(Component)
    mount(Component)

    expect(info.callCount).to.equal(4)
  })

  it('does not call stubbed children lifecycle hooks', () => {
    shallow(ComponentWithNestedChildren)
    expect(info.called).to.equal(false)
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

    const wrapper = shallow(TestComponent)
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

    const wrapper = shallow(TestComponent)
    expect(wrapper.find(ComponentWithPTag).exists()).to.equal(true)
    expect(wrapper.find('p').exists()).to.equal(false)
  })

  it('stubs Vue class component children', () => {
    if (vueVersion < 2.3) {
      return
    }
    const wrapper = shallow(ComponentAsAClassWithChild)
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
    const wrapper = shallow(TestComponent)
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
    const wrapper = shallow(TestComponent)
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

    expect(shallow(RecursiveComponent, {
      propsData: {
        items: ['', '']
      }
    }).findAll(RecursiveComponent).length).to.equal(2)
    RecursiveComponent.components = {
      'recursive-component': { render: h => h('div') }
    }
    expect(shallow(RecursiveComponent, {
      propsData: {
        items: ['', '']
      }
    }).findAll(RecursiveComponent).length).to.equal(2)
  })

  it('throws an error when the component fails to mount', () => {
    expect(() => shallow({
      template: '<div></div>',
      mounted: function () {
        throw (new Error('Error'))
      }
    })).to.throw()
  })
})
