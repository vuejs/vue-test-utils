import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { mount, createLocalVue } from 'packages/test-utils/src'
import CompositionAPI, { createElement } from '@vue/composition-api'
import Component from '~resources/components/component.vue'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithMixin from '~resources/components/component-with-mixin.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import { injectSupported, vueVersion } from '~resources/utils'
import { describeRunIf, itDoNotRunIf, itSkipIf } from 'conditional-specs'
import Vuex from 'vuex'

describeRunIf(process.env.TEST_ENV !== 'node', 'mount', () => {
  const windowSave = window

  afterEach(() => {
    if (process.env.TEST_ENV !== 'browser') {
      window = windowSave // eslint-disable-line no-native-reassign
    }
  })

  it('returns new VueWrapper with mounted Vue instance if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.vm).toBeTruthy()
  })

  it('handles root functional component', () => {
    const TestComponent = {
      functional: true,
      render(h) {
        return h('div', [h('p'), h('p')])
      }
    }

    const wrapper = mount(TestComponent)
    expect(wrapper.findAll('p').length).toEqual(2)
  })

  it('returns new VueWrapper with correct props data', () => {
    const prop1 = { test: 'TEST' }
    const wrapper = mount(ComponentWithProps, { propsData: { prop1 } })
    expect(wrapper.vm).toBeTruthy()
    if (wrapper.vm.$props) {
      expect(wrapper.vm.$props.prop1).toEqual(prop1)
    } else {
      expect(wrapper.vm.$options.propsData.prop1).toEqual(prop1)
    }
  })

  itDoNotRunIf(
    vueVersion < 2.3,
    'handles propsData for extended components',
    () => {
      const prop1 = 'test'
      const TestComponent = Vue.extend(ComponentWithProps)
      const wrapper = mount(TestComponent, {
        propsData: {
          prop1
        }
      })
      expect(wrapper.text()).toContain(prop1)
    }
  )

  it('handles uncompiled extended Vue component', () => {
    const BaseComponent = {
      template: '<div />'
    }
    const TestComponent = {
      extends: BaseComponent
    }
    const wrapper = mount(TestComponent)
    expect(wrapper.findAll('div').length).toEqual(1)
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
    expect(wrapper.findAll('div').length).toEqual(1)
  })

  itSkipIf(
    vueVersion < 2.3,
    'handles extended components added to Vue constructor',
    () => {
      const ChildComponent = Vue.extend({
        render: h => h('div'),
        mounted() {
          this.$route.params
        }
      })
      Vue.component('child-component', ChildComponent)
      const TestComponent = {
        template: '<child-component />'
      }
      let wrapper
      try {
        wrapper = mount(TestComponent, {
          mocks: {
            $route: {}
          }
        })
      } catch (err) {
      } finally {
        delete Vue.options.components['child-component']
        expect(wrapper.find(ChildComponent).exists()).toEqual(true)
      }
    }
  )

  it('does not use cached component', () => {
    ComponentWithMixin.methods.someMethod = jest.fn()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod).toHaveBeenCalledTimes(1)
    ComponentWithMixin.methods.someMethod = jest.fn()
    mount(ComponentWithMixin)
    expect(ComponentWithMixin.methods.someMethod).toHaveBeenCalledTimes(1)
  })

  it('throws an error if window is undefined', () => {
    if (
      !(navigator.userAgent.includes && navigator.userAgent.includes('node.js'))
    ) {
      return
    }

    const message =
      '[vue-test-utils]: window is undefined, vue-test-utils needs to be run in a browser environment.\n You can run the tests in node using JSDOM'
    window = undefined // eslint-disable-line no-native-reassign

    expect(() => mount(compileToFunctions('<div />'))).toThrow(message)
  })

  it('compiles inline templates', () => {
    const wrapper = mount({
      template: `<div>foo</div>`
    })
    expect(wrapper.vm).toBeTruthy()
    expect(wrapper.html()).toEqual(`<div>foo</div>`)
  })

  itDoNotRunIf(
    !(navigator.userAgent.includes && navigator.userAgent.includes('node.js')),
    'compiles templates from querySelector',
    () => {
      const template = window.createElement('div')
      template.setAttribute('id', 'foo')
      template.innerHTML = '<div>foo</div>'
      window.document.body.appendChild(template)

      const wrapper = mount({
        template: '#foo'
      })
      expect(wrapper.vm).toBeTruthy()
      expect(wrapper.html()).toEqual(`<div>foo</div>`)

      window.body.removeChild(template)
    }
  )

  itDoNotRunIf(vueVersion < 2.3, 'overrides methods', () => {
    const stub = jest.fn()
    const TestComponent = Vue.extend({
      template: '<div />',
      methods: {
        callStub() {
          stub()
        }
      }
    })
    mount(TestComponent, {
      methods: {
        callStub() {}
      }
    }).vm.callStub()

    expect(stub).not.toHaveBeenCalled()
  })

  // Problems accessing options of twice extended components in Vue < 2.3
  itDoNotRunIf(vueVersion < 2.3, 'compiles extended components', () => {
    const TestComponent = Vue.component('test-component', {
      template: '<div></div>'
    })
    const wrapper = mount(TestComponent)
    expect(wrapper.html()).toEqual(`<div></div>`)
  })

  itDoNotRunIf(
    vueVersion < 2.4, // auto resolve of default export added in 2.4
    'handles components as dynamic imports',
    done => {
      const TestComponent = {
        template: '<div><async-component /></div>',
        components: {
          AsyncComponent: () => import('~resources/components/component.vue')
        }
      }
      const wrapper = mount(TestComponent)
      setTimeout(() => {
        expect(wrapper.find(Component).exists()).toEqual(true)
        done()
      })
    }
  )

  it('deletes mounting options before passing options to component', () => {
    const wrapper = mount(
      {
        template: '<div />'
      },
      {
        provide: {
          prop: 'val'
        },
        attachToDocument: 'attachToDocument',
        mocks: {
          prop: 'val'
        },
        slots: {
          prop: Component
        },
        localVue: createLocalVue(),
        stubs: {
          prop: { template: '<div />' }
        },
        attrs: {
          prop: 'val'
        },
        listeners: {
          prop: 'val'
        }
      }
    )
    if (injectSupported) {
      expect(typeof wrapper.vm.$options.provide).toEqual(
        vueVersion < 2.5 ? 'function' : 'object'
      )
    }

    expect(wrapper.vm.$options.attachToDocument).toEqual(undefined)
    expect(wrapper.vm.$options.mocks).toEqual(undefined)
    expect(wrapper.vm.$options.slots).toEqual(undefined)
    expect(wrapper.vm.$options.localVue).toEqual(undefined)
    expect(wrapper.vm.$options.stubs).toEqual(undefined)
    expect(wrapper.vm.$options.context).toEqual(undefined)
    expect(wrapper.vm.$options.attrs).toEqual(undefined)
    expect(wrapper.vm.$options.listeners).toEqual(undefined)
    wrapper.destroy()
  })

  itDoNotRunIf(vueVersion < 2.3, 'injects store correctly', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store()
    const wrapper = mount(ComponentAsAClass, {
      store,
      localVue
    })
    wrapper.vm.getters
    mount(
      {
        template: '<div>{{$store.getters}}</div>'
      },
      { store, localVue }
    )
  })

  it('propagates errors when they are thrown', () => {
    const TestComponent = {
      template: '<div></div>',
      mounted: function() {
        throw new Error('Error in mounted')
      }
    }

    const fn = () => mount(TestComponent)
    expect(fn).toThrow('Error in mounted')
  })

  it('propagates errors when they are thrown by a nested component', () => {
    const childComponent = {
      template: '<div></div>',
      mounted: function() {
        throw new Error('Error in mounted')
      }
    }
    const rootComponent = {
      render: function(h) {
        return h('div', [h(childComponent)])
      }
    }

    const fn = () => {
      mount(rootComponent)
    }

    expect(fn).toThrow('Error in mounted')
  })

  it('adds unused propsData as attributes', () => {
    const wrapper = mount(ComponentWithProps, {
      attachToDocument: true,
      propsData: {
        prop1: 'prop1',
        extra: 'attr'
      },
      attrs: {
        height: '50px'
      }
    })

    if (vueVersion > 2.3) {
      expect(wrapper.vm.$attrs).toEqual({ height: '50px', extra: 'attr' })
    }

    expect(wrapper.html()).toEqual(
      '<div height="50px" extra="attr">\n' +
        '  <p class="prop-1">prop1</p>\n' +
        '  <p class="prop-2"></p>\n' +
        '</div>'
    )
    wrapper.destroy()
  })

  it('overwrites the component options with the instance options', () => {
    const Component = {
      template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
      methods: {
        foo() {
          return 'a'
        },
        bar() {
          return 'b'
        }
      }
    }
    const options = {
      methods: {
        bar() {
          return 'B'
        },
        baz() {
          return 'C'
        }
      }
    }
    const wrapper = mount(Component, options)
    expect(wrapper.text()).toEqual('aBC')
  })

  it('handles inline components', () => {
    const ChildComponent = {
      render(h) {
        h('p', this.$route.params)
      }
    }
    const TestComponent = {
      render: h => h(ChildComponent)
    }
    const localVue = createLocalVue()
    localVue.prototype.$route = {}
    const wrapper = mount(TestComponent, {
      localVue
    })
    expect(wrapper.findAll(ChildComponent).length).toEqual(1)
  })

  it('handles nested components with extends', () => {
    const GrandChildComponent = {
      template: '<div />',
      created() {
        this.$route.params
      }
    }
    const ChildComponent = Vue.extend({
      template: '<grand-child-component />',
      components: {
        GrandChildComponent
      }
    })
    const TestComponent = {
      template: '<child-component />',
      components: {
        ChildComponent
      }
    }
    const localVue = createLocalVue()
    localVue.prototype.$route = {}
    mount(TestComponent, {
      localVue
    })
  })

  it('works with composition api plugin', () => {
    const localVue = createLocalVue()
    localVue.use(CompositionAPI)
    const Comp = {
      setup() {
        return () => createElement('div', 'composition api')
      }
    }
    const wrapper = mount(Comp, { localVue })
    expect(wrapper.html()).toEqual('<div>composition api</div>')
  })

  itDoNotRunIf.skip(
    vueVersion >= 2.5,
    'throws if component throws during update',
    () => {
      const TestComponent = {
        template: '<div :p="a" />',
        updated() {
          throw new Error('err')
        },
        data: () => ({
          a: 1
        })
      }
      const wrapper = mount(TestComponent)
      const fn = () => {
        wrapper.vm.a = 2
      }
      expect(fn).toThrow()
      wrapper.destroy()
    }
  )
})
