import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { mount, createLocalVue } from '~vue/test-utils'
import Component from '~resources/components/component.vue'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithMixin from '~resources/components/component-with-mixin.vue'
import { injectSupported, vueVersion } from '~resources/utils'

describe('mount', () => {
  it('returns new VueWrapper with mounted Vue instance if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.vm).to.be.an('object')
  })

  it('returns new VueWrapper with mounted Vue instance when root is functional component', () => {
    const FunctionalComponent = {
      functional: true,
      render (h) {
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

    const wrapper = mount(FunctionalComponent)
    expect(wrapper.findAll('p').length).to.equal(2)
  })

  it('returns new VueWrapper with mounted Vue instance with props, if passed as propsData', () => {
    const prop1 = { test: 'TEST' }
    const wrapper = mount(ComponentWithProps, { propsData: { prop1 }})
    expect(wrapper.vm).to.be.an('object')
    if (wrapper.vm.$props) {
      expect(wrapper.vm.$props.prop1).to.equal(prop1)
    } else {
      expect(wrapper.vm.$options.propsData.prop1).to.equal(prop1)
    }
  })

  it('returns new VueWrapper with mounted Vue instance initialized with Vue.extend with props, if passed as propsData', () => {
    const prop1 = { test: 'TEST' }
    const wrapper = mount(Vue.extend(ComponentWithProps), { propsData: { prop1 }})
    expect(wrapper.vm).to.be.an('object')
    if (wrapper.vm.$props) {
      expect(wrapper.vm.$props.prop1).to.equal(prop1)
    } else {
      expect(wrapper.vm.$options.propsData.prop1).to.equal(prop1)
    }
  })

  it('handles uncompiled extended Vue component', () => {
    const BaseComponent = {
      template: '<div />'
    }
    const TestComponent = {
      extends: BaseComponent
    }
    const wrapper = mount(TestComponent)
    expect(wrapper.findAll('div').length).to.equal(1)
  })

  it('handles nested uncompiled extended Vue component', () => {
    const BaseComponent = {
      template: '<div />'
    }
    const TestComponentA = {
      extends: BaseComponent
    }
    const TestComponentB = {
      extends: TestComponentA
    }
    const TestComponentC = {
      extends: TestComponentB
    }
    const TestComponentD = {
      extends: TestComponentC
    }
    const wrapper = mount(TestComponentD)
    expect(wrapper.findAll('div').length).to.equal(1)
  })

  it('does not use cached component', () => {
    ComponentWithMixin.methods.someMethod = sinon.stub()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod.callCount).to.equal(1)
    ComponentWithMixin.methods.someMethod = sinon.stub()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod.callCount).to.equal(1)
  })

  it('throws an error if window is undefined', () => {
    if (!(navigator.userAgent.includes && navigator.userAgent.includes('node.js'))) {
      console.log('window read only. skipping test ...')
      return
    }
    const windowSave = global.window

    after(() => {
      global.window = windowSave
    })
    const message = '[vue-test-utils]: window is undefined, vue-test-utils needs to be run in a browser environment.\n You can run the tests in node using JSDOM'
    global.window = undefined

    expect(() => mount(compileToFunctions('<div />'))).to.throw().with.property('message', message)
  })

  it('compiles inline templates', () => {
    const wrapper = mount({
      template: `<div>foo</div>`
    })
    expect(wrapper.vm).to.be.an('object')
    expect(wrapper.html()).to.equal(`<div>foo</div>`)
  })

  it('deletes mounting options before passing options to component', () => {
    const wrapper = mount({
      render: h => h('div')
    }, {
      provide: {
        'prop': 'val'
      },
      attachToDocument: 'attachToDocument',
      mocks: {
        'prop': 'val'
      },
      slots: {
        'prop': Component
      },
      localVue: createLocalVue(),
      stubs: {
        'prop': 'val'
      },
      attrs: {
        'prop': 'val'
      },
      listeners: {
        'prop': 'val'
      }
    })
    if (injectSupported()) {
      // provide is added by Vue, it's a function in Vue > 2.3
      if (vueVersion > 2.3) {
        expect(typeof wrapper.vm.$options.provide).to.equal('function')
      } else {
        expect(typeof wrapper.vm.$options.provide).to.equal('object')
      }
    }

    expect(wrapper.vm.$options.attachToDocument).to.equal(undefined)
    expect(wrapper.vm.$options.mocks).to.equal(undefined)
    expect(wrapper.vm.$options.slots).to.equal(undefined)
    expect(wrapper.vm.$options.localVue).to.equal(undefined)
    expect(wrapper.vm.$options.stubs).to.equal(undefined)
    expect(wrapper.vm.$options.context).to.equal(undefined)
    expect(wrapper.vm.$options.attrs).to.equal(undefined)
    expect(wrapper.vm.$options.listeners).to.equal(undefined)
  })

  it('propagates errors when they are thrown', () => {
    const TestComponent = {
      template: '<div></div>',
      mounted: function () {
        throw new Error('Error in mounted')
      }
    }

    const fn = () => mount(TestComponent)
    expect(fn).to.throw('Error in mounted')
  })

  it('propagates errors when they are thrown by a nested component', () => {
    const childComponent = {
      template: '<div></div>',
      mounted: function () {
        throw new Error('Error in mounted')
      }
    }
    const rootComponent = {
      render: function (h) {
        return h('div', [h(childComponent)])
      }
    }

    const fn = () => {
      mount(rootComponent)
    }

    expect(fn).to.throw('Error in mounted')
  })

  it('overwrites the component options with the options other than the mounting options when the options for mount contain those', () => {
    const Component = {
      template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
      methods: {
        foo () {
          return 'a'
        },
        bar () {
          return 'b'
        }
      }
    }
    const options = {
      methods: {
        bar () {
          return 'B'
        },
        baz () {
          return 'C'
        }
      }
    }
    const wrapper = mount(Component, options)
    expect(wrapper.text()).to.equal('aBC')
  })
})
