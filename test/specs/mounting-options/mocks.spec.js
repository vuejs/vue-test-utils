import { createLocalVue } from '~vue-test-utils'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'
import {
  describeWithShallowAndMount,
  itDoNotRunIf
 } from '~resources/test-utils'

describeWithShallowAndMount('options.mocks', (mountingMethod) => {
  it('adds variables to vm when passed as mocks object', () => {
    const $store = { store: true }
    const $route = { path: 'http://test.com' }
    const wrapper = mountingMethod(Component, {
      mocks: {
        $store,
        $route
      }
    })
    expect(wrapper.vm.$store).to.equal($store)
    expect(wrapper.vm.$route).to.equal($route)
  })

  it('adds variables to vm when passed as mocks object', () => {
    const stub = sinon.stub()
    const $reactiveMock = { value: 'value' }
    const wrapper = mountingMethod({
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
    }, {
      mocks: { $reactiveMock }
    })
    expect(wrapper.text()).to.contain('value')
    $reactiveMock.value = 'changed value'
    wrapper.update()
    expect(wrapper.text()).to.contain('changed value')
  })

  itDoNotRunIf(mountingMethod.name === 'shallow',
    'adds variables available to nested vms', () => {
      const count = 1
      const wrapper = mountingMethod({
        template: '<div><component-with-vuex /></div>',
        components: {
          ComponentWithVuex
        }
      }, {
        mocks: { $store: { state: { count, foo: {}}}}
      })
      expect(wrapper.text()).contains(count)
    })

  itDoNotRunIf(mountingMethod.name === 'shallow',
  'adds variables available to nested vms using localVue', () => {
    const localVue = createLocalVue()
    const count = 1
    const wrapper = mountingMethod({
      template: '<div><component-with-vuex /></div>',
      components: {
        ComponentWithVuex
      }
    }, {
      mocks: { $store: { state: { count, foo: {}}}},
      localVue
    })
    expect(wrapper.text()).contains(count)
  })

  it('does not affect global vue class when passed as mocks object', () => {
    const $store = { store: true }
    const wrapper = mountingMethod(Component, {
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.$store).to.equal($store)
    const freshWrapper = mountingMethod(Component)
    expect(typeof freshWrapper.vm.$store).to.equal('undefined')
  })

  it('logs that a property cannot be overwritten if there are problems writing', () => {
    const error = sinon.stub(console, 'error')
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
    const msg = '[vue-test-utils]: could not overwrite property $store, this usually caused by a plugin that has added the property as a read-only value'
    expect(error.calledWith(msg)).to.equal(true)
    error.restore()
  })

  it('logs that a property cannot be overwritten if there are problems writing', () => {
    const error = sinon.stub(console, 'error')
    const localVue = createLocalVue()
    Object.defineProperty(localVue.prototype, '$val', {
      value: 42
    })
    const $val = 64
    mountingMethod(Component, {
      localVue,
      mocks: {
        $val
      }
    })
    const msg = '[vue-test-utils]: could not overwrite property $val, this usually caused by a plugin that has added the property as a read-only value'
    expect(error.calledWith(msg)).to.equal(true)
    error.restore()
  })
})
