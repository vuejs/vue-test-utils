import mount from '~src/mount'
import createLocalVue from '~src/create-local-vue'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated'
]

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

  it('replaces lifecycle hooks with mocks', (done) => {

    const originalHooks = {}
    const mockedHooks = {}
    LIFECYCLE_HOOKS.forEach(hook => {
      originalHooks[hook] = sinon.spy()
      mockedHooks[hook] = sinon.spy()
    })

    const wrapper = mount({
      ...originalHooks
    }, {
      mocks: mockedHooks
    })

    // call methods manually, that will not be triggered by mount, forceUpdate and destroy
    const manualCalledHooks = [ 'activated', 'deactivated' ]
    manualCalledHooks.forEach(hook => wrapper.vm.$options[hook]
      .forEach(handler => handler.call(wrapper.vm)))

    // force udpate and wait till it was resolved
    wrapper.vm.$forceUpdate()
    wrapper.vm.$nextTick(() => {
      wrapper.destroy()

      try {
        LIFECYCLE_HOOKS.forEach(hook => {
          expect(originalHooks[hook].callCount).to.equal(0,
            `Error: Lifecycle hook ${hook} was not overridden properly`)
          expect(mockedHooks[hook].callCount).to.equal(1,
            `Error: Lifecycle hook ${hook} mock was not called`)
        })
        done()
      } catch (error) {
        done(error)
      }
    })
  })

  it('does not affect mixin hooks when mocking lifecycle hooks', (done) => {
    const localVue = createLocalVue()

    const mixinHooks = {}
    const mockedHooks = {}
    LIFECYCLE_HOOKS.forEach(hook => {
      mockedHooks[hook] = sinon.spy()
      mixinHooks[hook] = sinon.spy()
    })

    // install mixins
    localVue.mixin(mixinHooks)

    const wrapper = mount({ }, {
      localVue,
      mocks: mockedHooks
    })

    // call methods manually, that will not be triggered by mount, forceUpdate and destroy
    const manualCalledHooks = [ 'activated', 'deactivated' ]
    manualCalledHooks.forEach(hook => wrapper.vm.$options[hook]
      .forEach(handler => handler.call(wrapper.vm)))

    // force udpate and wait till it was resolved
    wrapper.vm.$forceUpdate()
    wrapper.vm.$nextTick(() => {
      wrapper.destroy()

      try {
        LIFECYCLE_HOOKS.forEach(hook => {
          expect(mockedHooks[hook].callCount).to.equal(1,
            `Error: Lifecycle hook ${hook} mock was not called`)
          expect(mixinHooks[hook].callCount).to.equal(1,
            `Error: Lifecycle hook ${hook} installed by mixin was not called`)
        })
        done()
      } catch (error) {
        done(error)
      }
    })
  })
})
