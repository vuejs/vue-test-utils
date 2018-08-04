import { createLocalVue, config } from '~vue/test-utils'
import Vue from 'vue'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'
import { describeWithMountingMethods } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

describeWithMountingMethods('options.mocks', mountingMethod => {
  let configMocksSave

  beforeEach(() => {
    configMocksSave = config.mocks
    config.mocks = {}
    sinon.stub(console, 'error')
  })

  afterEach(() => {
    config.mocks = configMocksSave
    console.error.restore()
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
    const HTML =
      mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
    expect(HTML).contains('true')
    expect(HTML).contains('http://test.com')
  })

  it('adds variables to extended components', () => {
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
    const HTML =
      mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
    expect(HTML).contains('http://test.com')
  })

  // render returns a string so reactive does not apply
  itDoNotRunIf(
    mountingMethod.name === 'renderToString',
    'adds variables as reactive properties to vm when passed',
    () => {
      const stub = sinon.stub()
      const $reactiveMock = { value: 'value' }
      const wrapper = mountingMethod(
        {
          template: `
        <div>
          {{value}}
        </div>
      `,
          computed: {
            value () {
              return this.$reactiveMock.value
            }
          },
          watch: {
            value () {
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
      expect(wrapper.text()).to.contain('changed value')
    }
  )

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
          mocks: { $store: { state: { count, foo: {}}}}
        }
      )
      const HTML =
        mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
      expect(HTML).contains(count)
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
          mocks: { $store: { state: { count, foo: {}}}},
          localVue
        }
      )
      const HTML =
        mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
      expect(HTML).contains(count)
    }
  )

  itDoNotRunIf(
    mountingMethod.name === 'renderToString',
    'does not affect global vue class when passed as mocks object',
    () => {
      const $store = { store: true }
      const wrapper = mountingMethod(Component, {
        mocks: {
          $store
        }
      })
      expect(wrapper.vm.$store).to.equal($store)
      const freshWrapper = mountingMethod(Component)
      expect(typeof freshWrapper.vm.$store).to.equal('undefined')
    }
  )

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
    const HTML =
      mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
    expect(HTML).to.contain('locallyMockedValue')
  })
})
