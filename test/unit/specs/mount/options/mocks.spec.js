import mount from '~src/mount'
import createLocalVue from '~src/create-local-vue'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'

describe('mount.mocks', () => {
  it('adds variables to vm when passed as mocks object', () => {
    const $store = { store: true }
    const $route = { path: 'http://test.com' }
    const wrapper = mount(Component, {
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
    const wrapper = mount({
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

  it('adds variables available to nested vms', () => {
    const count = 1
    const wrapper = mount({
      template: '<div><component-with-vuex /></div>',
      components: {
        ComponentWithVuex
      }
    }, {
      mocks: { $store: { state: { count, foo: {}}}}
    })
    expect(wrapper.text()).contains(count)
  })

  it('adds variables available to nested vms using localVue', () => {
    const localVue = createLocalVue()
    const count = 1
    const wrapper = mount({
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
    const wrapper = mount(Component, {
      mocks: {
        $store
      }
    })
    expect(wrapper.vm.$store).to.equal($store)
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$store).to.equal('undefined')
  })
})
