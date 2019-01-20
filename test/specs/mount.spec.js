import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import { mount, createLocalVue } from '~vue/test-utils'
import Component from '~resources/components/component.vue'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import ComponentWithMixin from '~resources/components/component-with-mixin.vue'
import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
import { injectSupported, vueVersion } from '~resources/utils'
import { describeRunIf, itDoNotRunIf, itSkipIf } from 'conditional-specs'
import Vuex from 'vuex'

describeRunIf(process.env.TEST_ENV !== 'node', 'mount', () => {
  const windowSave = window

  beforeEach(() => {
    sinon.stub(console, 'error')
  })

  afterEach(() => {
    window = windowSave // eslint-disable-line no-native-reassign
    console.error.restore()
  })

  it('returns new VueWrapper with mounted Vue instance if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.vm).to.be.an('object')
  })

  it('returns new VueWrapper when root is functional component', () => {
    const FunctionalComponent = {
      functional: true,
      render (h) {
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

    const wrapper = mount(FunctionalComponent)
    expect(wrapper.findAll('p').length).to.equal(2)
  })

  it('returns new VueWrapper with correct props data', () => {
    const prop1 = { test: 'TEST' }
    const wrapper = mount(ComponentWithProps, { propsData: { prop1 }})
    expect(wrapper.vm).to.be.an('object')
    if (wrapper.vm.$props) {
      expect(wrapper.vm.$props.prop1).to.equal(prop1)
    } else {
      expect(wrapper.vm.$options.propsData.prop1).to.equal(prop1)
    }
  })

  itDoNotRunIf(vueVersion < 2.3,
    'handles propsData for extended components', () => {
      const prop1 = 'test'
      const TestComponent = Vue.extend(ComponentWithProps)
      const wrapper = mount(TestComponent, {
        propsData: {
          prop1
        }
      })
      expect(wrapper.text()).to.contain(prop1)
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

  itSkipIf(
    vueVersion < 2.3,
    'handles extended components added to Vue constructor', () => {
      const ChildComponent = Vue.extend({
        template: '<div />',
        mounted () {
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
      } catch (err) {} finally {
        delete Vue.options.components['child-component']
        expect(wrapper.find(ChildComponent).exists()).to.equal(true)
      }
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
    if (
      !(navigator.userAgent.includes && navigator.userAgent.includes('node.js'))
    ) {
      console.log('window read only. skipping test ...')
      return
    }

    const message =
      '[vue-test-utils]: window is undefined, vue-test-utils needs to be run in a browser environment.\n You can run the tests in node using JSDOM'
    window = undefined // eslint-disable-line no-native-reassign

    expect(() => mount(compileToFunctions('<div />')))
      .to.throw()
      .with.property('message', message)
  })

  it('compiles inline templates', () => {
    const wrapper = mount({
      template: `<div>foo</div>`
    })
    expect(wrapper.vm).to.be.an('object')
    expect(wrapper.html()).to.equal(`<div>foo</div>`)
  })

  itDoNotRunIf(
    vueVersion < 2.3,
    'overrides methods', () => {
      const stub = sinon.stub()
      const TestComponent = Vue.extend({
        template: '<div />',
        methods: {
          callStub () {
            stub()
          }
        }
      })
      mount(TestComponent, {
        methods: {
          callStub () {}
        }
      }).vm.callStub()

      expect(stub).not.called
    })

  it.skip('overrides component prototype', () => {
    const mountSpy = sinon.spy()
    const destroySpy = sinon.spy()
    const Component = Vue.extend({})
    const { $mount: originalMount, $destroy: originalDestroy } = Component.prototype
    Component.prototype.$mount = function (...args) {
      originalMount.apply(this, args)
      mountSpy()
      return this
    }
    Component.prototype.$destroy = function () {
      originalDestroy.apply(this)
      destroySpy()
    }

    const wrapper = mount(Component)
    expect(mountSpy).called
    expect(destroySpy).not.called
    wrapper.destroy()
    expect(destroySpy).called
  })

  // Problems accessing options of twice extended components in Vue < 2.3
  itDoNotRunIf(vueVersion < 2.3, 'compiles extended components', () => {
    const TestComponent = Vue.component('test-component', {
      template: '<div></div>'
    })
    const wrapper = mount(TestComponent)
    expect(wrapper.html()).to.equal(`<div></div>`)
  })

  itDoNotRunIf(
    vueVersion < 2.4, // auto resolve of default export added in 2.4
    'handles components as dynamic imports', (done) => {
      const TestComponent = {
        template: '<div><async-component /></div>',
        components: {
          AsyncComponent: () => import('~resources/components/component.vue')
        }
      }
      const wrapper = mount(TestComponent)
      setTimeout(() => {
        expect(wrapper.find(Component).exists()).to.equal(true)
        done()
      })
    })

  it('deletes mounting options before passing options to component', () => {
    const wrapper = mount(
      {
        render: h => h('div')
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
          prop: 'val'
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
      expect(typeof wrapper.vm.$options.provide).to.equal('object')
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

  itDoNotRunIf(
    vueVersion < 2.3,
    'injects store correctly', () => {
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

  itDoNotRunIf(vueVersion < 2.2, 'logs errors once after mount', done => {
    Vue.config.errorHandler = null
    const TestComponent = {
      template: '<div/>',
      updated: function () {
        throw new Error('Error in updated')
      }
    }

    const wrapper = mount(TestComponent, {
      sync: false
    })
    wrapper.vm.$forceUpdate()
    setTimeout(() => {
      vueVersion > 2.1
        ? expect(console.error).calledTwice
        : expect(console.error).calledOnce
      done()
    })
  })

  it('restores user error handler after mount', () => {
    const existingErrorHandler = () => {}
    Vue.config.errorHandler = existingErrorHandler
    const TestComponent = {
      template: '<div/>'
    }
    mount(TestComponent)
    expect(Vue.config.errorHandler).to.equal(existingErrorHandler)
    Vue.config.errorHandler = null
  })

  it('adds unused propsData as attributes', () => {
    const wrapper = mount(
      ComponentWithProps, {
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
      expect(wrapper.vm.$attrs).to.eql({ height: '50px', extra: 'attr' })
    }
    expect(wrapper.html()).to.equal(`<div height="50px" extra="attr"><p class="prop-1">prop1</p> <p class="prop-2"></p></div>`)
  })

  it('overwrites the component options with the instance options', () => {
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

  it('handles inline components', () => {
    const ChildComponent = {
      render (h) {
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
    expect(wrapper.findAll(ChildComponent).length).to.equal(1)
  })

  it('handles nested components with extends', () => {
    const GrandChildComponent = {
      template: '<div />',
      created () {
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
})
