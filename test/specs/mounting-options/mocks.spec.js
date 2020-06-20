import { createLocalVue, config } from '@vue/test-utils'
import Vue from 'vue'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itDoNotRunIf, itSkipIf, itRunIf } from 'conditional-specs'

describeWithShallowAndMount('options.mocks', mountingMethod => {
  const sandbox = sinon.createSandbox()
  let configMocksSave

  beforeEach(() => {
    configMocksSave = config.mocks
    config.mocks = {}
    sandbox.stub(console, 'error').callThrough()
  })

  afterEach(() => {
    config.mocks = configMocksSave
    sandbox.reset()
    sandbox.restore()
  })

  it('adds variables to vm when passed', () => {
    const TestComponent = {
      template: `
        <div>
          {{$store.store}}
          {{$route.path}}
        </div>
      `
    }
    const $store = { store: true }
    const $route = { path: 'http://test.com' }
    const wrapper = mountingMethod(TestComponent, {
      mocks: {
        $store,
        $route
      }
    })
    expect(wrapper.html()).contains('true')
    expect(wrapper.html()).contains('http://test.com')
  })

  itSkipIf(vueVersion < 2.3, 'adds variables to extended components', () => {
    const extendedComponent = Vue.extend({
      name: 'extended-component'
    })
    const TestComponent = extendedComponent.extend({
      template: `
        <div>
          {{$route.path}}
        </div>
      `
    })
    const $route = { path: 'http://test.com' }
    const wrapper = mountingMethod(TestComponent, {
      mocks: {
        $route
      }
    })
    expect(wrapper.html()).contains('http://test.com')
  })

  it('adds variables as reactive properties to vm when passed', async () => {
    const stub = sandbox.stub()
    const $reactiveMock = { value: 'value' }
    const wrapper = mountingMethod(
      {
        template: `<div>{{value}}</div>`,
        computed: {
          value() {
            return this.$reactiveMock.value
          }
        },
        watch: {
          value() {
            stub()
          }
        }
      },
      {
        mocks: { $reactiveMock }
      }
    )
    expect(wrapper.text()).to.contain('value')
    $reactiveMock.value = 'changed value'
    await Vue.nextTick()
    expect(wrapper.text()).to.contain('changed value')
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'adds variables available to nested vms',
    () => {
      const count = 1
      const wrapper = mountingMethod(
        {
          template: '<div><component-with-vuex /></div>',
          components: {
            ComponentWithVuex
          }
        },
        {
          mocks: { $store: { state: { count, foo: {} } } }
        }
      )
      expect(wrapper.html()).contains(count)
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'adds variables available to nested vms using localVue',
    () => {
      const localVue = createLocalVue()
      const count = 1
      const wrapper = mountingMethod(
        {
          template: '<div><component-with-vuex /></div>',
          components: {
            ComponentWithVuex
          }
        },
        {
          mocks: { $store: { state: { count, foo: {} } } },
          localVue
        }
      )
      expect(wrapper.html()).contains(count)
    }
  )

  it('does not affect global vue class when passed as mocks object', () => {
    const $store = { store: true }
    const wrapper = mountingMethod(Component, {
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.$store).toEqual($store)
    const freshWrapper = mountingMethod(Component)
    expect(typeof freshWrapper.vm.$store).toEqual('undefined')
  })

  it('logs that a property cannot be overwritten if there are problems writing', () => {
    const localVue = createLocalVue()
    Object.defineProperty(localVue.prototype, '$store', {
      value: 42
    })
    const $store = 64
    mountingMethod(Component, {
      localVue,
      mocks: {
        $store
      }
    })
    const msg =
      `[vue-test-utils]: could not overwrite property $store, this ` +
      `is usually caused by a plugin that has added the property as ` +
      `a read-only value`
    expect(console.error).calledWith(msg)
  })

  it('prioritize mounting options over config', () => {
    config.mocks['$global'] = 'globallyMockedValue'

    const TestComponent = {
      template: `
        <div>{{ $global }}</div>
      `
    }

    const wrapper = mountingMethod(TestComponent, {
      mocks: {
        $global: 'locallyMockedValue'
      }
    })
    expect(wrapper.html()).to.contain('locallyMockedValue')
  })

  itRunIf(
    vueVersion < 2.3,
    'throws an error if used with an extended component in Vue 2.3',
    () => {
      const TestComponent = Vue.extend({
        template: '<div></div>'
      })
      const message =
        `[vue-test-utils]: options.mocks is not supported for components ` +
        `created with Vue.extend in Vue < 2.3. You can set mocks to false ` +
        `to mount the component.`
      const fn = () =>
        mountingMethod(TestComponent, {
          mocks: { something: 'true' },
          stubs: false
        })
      expect(fn)
        .to.throw()
        .with.property('message', message)
    }
  )
})
