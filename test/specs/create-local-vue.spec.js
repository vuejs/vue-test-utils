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
import { itDoNotRunIf, itSkipIf } from 'conditional-specs'

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

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'Router should work properly with local Vue',
    async () => {
      const localVue = createLocalVue()
      localVue.use(VueRouter)
      const routes = [
        {
          path: '/',
          component: {
            render: h => h('div', 'home')
          }
        },
        {
          path: '/foo',
          component: {
            render: h => h('div', 'foo')
          }
        }
      ]
      const router = new VueRouter({
        routes
      })
      const wrapper = mountingMethod(ComponentWithRouter, { localVue, router })
      expect(wrapper.vm.$route).toBeTruthy()

      expect(wrapper.text()).toContain('home')

      await wrapper.find('a').trigger('click')
      expect(wrapper.text()).toContain('foo')

      const freshWrapper = mountingMethod(Component)
      expect(typeof freshWrapper.vm.$route).toEqual('undefined')
    }
  )

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
})
