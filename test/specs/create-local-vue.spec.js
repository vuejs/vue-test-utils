import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { createLocalVue } from 'packages/test-utils/src'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'
import ComponentWithRouter from '~resources/components/component-with-router.vue'
import ComponentWithSyncError from '~resources/components/component-with-sync-error.vue'
import ComponentWithAsyncError from '~resources/components/component-with-async-error.vue'
import { describeWithShallowAndMount, vueVersion } from '~resources/utils'
import { itSkipIf } from 'conditional-specs'

describeWithShallowAndMount('createLocalVue', mountingMethod => {
  it('installs Vuex without polluting global Vue', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store({
      state: {
        test: 0
      },
      mutations: {
        increment() {}
      }
    })
    const wrapper = mountingMethod(Component, { localVue, store })
    expect(wrapper.vm.$store).toBeTruthy()
    const freshWrapper = mountingMethod(Component)
    expect(typeof freshWrapper.vm.$store).toEqual('undefined')
  })

  it('Vuex should work properly with local Vue', async () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store({
      state: {
        count: 0
      },
      mutations: {
        increment(state) {
          state.count++
        }
      },
      modules: {
        foo: {
          state: () => ({ bar: 1 })
        }
      }
    })
    const wrapper = mountingMethod(ComponentWithVuex, { localVue, store })
    expect(wrapper.vm.$store).toBeTruthy()
    expect(wrapper.text()).toEqual('0 1')
    await wrapper.trigger('click')
    expect(wrapper.text()).toEqual('1 1')
  })

  it('installs Router without polluting global Vue', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const routes = [{ path: '/foo', component: Component }]
    const router = new VueRouter({
      routes
    })
    const wrapper = mountingMethod(Component, { localVue, router })
    expect(wrapper.vm.$route).toBeTruthy()
    const freshWrapper = mountingMethod(Component)
    expect(typeof freshWrapper.vm.$route).toEqual('undefined')
  })

  it('works with VueRouter', async () => {
    if (mountingMethod.name === 'shallowMount') {
      return
    }
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const Foo = {
      name: 'Foo',
      render: h => h('span', 'Foo component')
    }
    const routes = [{ path: '/foo', component: Foo }]
    const router = new VueRouter({
      routes
    })
    const wrapper = mountingMethod(ComponentWithRouter, {
      localVue,
      router
    })

    expect(wrapper.html()).not.toContain('Foo component')
    expect(wrapper.vm.$route).toBeTruthy()

    await wrapper.vm.$router.push('/foo')
    expect(wrapper.html()).toContain('Foo component')

    await wrapper.vm.$router.push('/')
    expect(wrapper.html()).not.toContain('Foo component')
    await wrapper.find('a').trigger('click')
    expect(wrapper.html()).toContain('Foo component')
  })

  it('use can take additional arguments', () => {
    const localVue = createLocalVue()
    const pluginOptions = { foo: 'bar' }
    const plugin = {
      install: function(_Vue, options) {
        expect(options).toEqual(pluginOptions)
      }
    }
    localVue.use(plugin, pluginOptions)
  })

  it('installs plugin into local Vue regardless of previous install in Vue', () => {
    let installCount = 0

    class Plugin {}
    Plugin.install = function(_Vue) {
      if (_Vue._installedPlugins) {
        expect(_Vue._installedPlugins.indexOf(Plugin)).toEqual(-1)
      }
      installCount++
    }

    Vue.use(Plugin)
    const localVue = createLocalVue()
    localVue.use(Plugin)

    if (localVue._installedPlugins) {
      expect(localVue._installedPlugins.indexOf(Plugin)).toEqual(0)
    }
    expect(installCount).toEqual(2)
  })

  itSkipIf(
    vueVersion < 2.4,
    'Calls `errorHandler` when an error is thrown synchronously',
    () => {
      const errorHandler = jest.fn()
      const localVue = createLocalVue({
        errorHandler
      })
      try {
        mountingMethod(ComponentWithSyncError, { localVue })
      } catch (e) {
        // asserting arguments is a bit difficult due to multiple Vue version support. Please see https://vuejs.org/v2/api/#errorHandler for more details
        expect(errorHandler).toHaveBeenCalledTimes(1)
      }
    }
  )

  itSkipIf(
    vueVersion < 2.6,
    'Exception suppresed in `errorHandler` is not logged to console.error',
    async () => {
      const component = Vue.component('TestComponent', {
        template: '<button id="btn" @click="clickHandler">Click me</button>',
        methods: {
          clickHandler() {
            throw new Error('Should not be logged')
          }
        }
      })
      const errorHandler = jest.fn()
      const localVue = createLocalVue({
        errorHandler
      })
      const wrapper = mountingMethod(component, { localVue })
      await wrapper.vm.$nextTick()

      const { error } = global.console
      const spy = jest.spyOn(global.console, 'error')
      await wrapper.trigger('click')
      global.console.error = error
      expect(spy).not.toHaveBeenCalled()
    }
  )

  itSkipIf(
    vueVersion < 2.6,
    'Exception raised in `errorHandler` bubbles up',
    async () => {
      const component = Vue.component('TestComponent', {
        template: '<button id="btn" @click="clickHandler">Click me</button>',
        methods: {
          clickHandler() {
            throw new Error()
          }
        }
      })
      const errorHandler = (err, vm, info) => {
        if (err) {
          throw new Error('An error that should log')
        }
      }
      const localVue = createLocalVue({
        errorHandler
      })
      const wrapper = mountingMethod(component, { localVue })
      await wrapper.vm.$nextTick()

      const { error } = global.console
      const spy = jest.spyOn(global.console, 'error')
      await wrapper.trigger('click')
      global.console.error = error
      expect(spy).toHaveBeenCalledWith(
        '[Vue warn]: Error in config.errorHandler: "Error: An error that should log"'
      )
    }
  )

  itSkipIf(
    process.env.TEST_ENV === 'browser' || vueVersion < 2.6,
    'Calls `errorHandler` when an error is thrown asynchronously',
    async () => {
      const errorHandler = jest.fn()
      const localVue = createLocalVue({
        errorHandler
      })

      try {
        mountingMethod(ComponentWithAsyncError, { localVue })

        await Vue.nextTick()
        await setTimeout()
      } finally {
        // asserting arguments is a bit difficult due to multiple Vue version support. Please see https://vuejs.org/v2/api/#errorHandler for more details
        expect(errorHandler).toHaveBeenCalledTimes(1)
      }
    }
  )

  // This test is related to the issue 1768.
  // See: https://github.com/vuejs/vue-test-utils/issues/1768
  itSkipIf(
    process.env.TEST_ENV === 'browser' || vueVersion < 2.6,
    'Does not exceed maximum call stack size when no custom error handler is defined',
    async () => {
      const { error } = global.console
      const spy = jest.spyOn(global.console, 'error')
      const localVue = createLocalVue()

      try {
        mountingMethod(ComponentWithSyncError, { localVue })
      } catch {
        const expected = expect.stringMatching(
          /Maximum call stack size exceeded/
        )

        global.console.error = error
        expect(spy).not.toHaveBeenCalledWith(expected)
      }
    }
  )
})
