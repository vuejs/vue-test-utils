import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import { createLocalVue } from '~vue/test-utils'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'
import ComponentWithRouter from '~resources/components/component-with-router.vue'
import { describeWithShallowAndMount } from '~resources/utils'
import { itDoNotRunIf } from 'conditional-specs'

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
    expect(wrapper.vm.$store).to.be.an('object')
    const freshWrapper = mountingMethod(Component)
    expect(typeof freshWrapper.vm.$store).to.equal('undefined')
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
    expect(wrapper.vm.$store).to.be.an('object')
    expect(wrapper.text()).to.equal('0 1')
    wrapper.trigger('click')
    await Vue.nextTick()
    expect(wrapper.text()).to.equal('1 1')
  })

  it('installs Router without polluting global Vue', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const routes = [{ path: '/foo', component: Component }]
    const router = new VueRouter({
      routes
    })
    const wrapper = mountingMethod(Component, { localVue, router })
    expect(wrapper.vm.$route).to.be.an('object')
    const freshWrapper = mountingMethod(Component)
    expect(typeof freshWrapper.vm.$route).to.equal('undefined')
  })

  itDoNotRunIf(
    mountingMethod.name === 'shallowMount',
    'Router should work properly with local Vue',
    () => {
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
      expect(wrapper.vm.$route).to.be.an('object')

      expect(wrapper.text()).to.contain('home')

      wrapper.find('a').trigger('click')
      expect(wrapper.text()).to.contain('foo')

      const freshWrapper = mountingMethod(Component)
      expect(typeof freshWrapper.vm.$route).to.equal('undefined')
    }
  )

  it('use can take additional arguments', () => {
    const localVue = createLocalVue()
    const pluginOptions = { foo: 'bar' }
    const plugin = {
      install: function(_Vue, options) {
        expect(options).to.equal(pluginOptions)
      }
    }
    localVue.use(plugin, pluginOptions)
  })

  it('installs plugin into local Vue regardless of previous install in Vue', () => {
    let installCount = 0

    class Plugin {}
    Plugin.install = function(_Vue) {
      if (_Vue._installedPlugins) {
        expect(_Vue._installedPlugins.indexOf(Plugin)).to.equal(-1)
      }
      installCount++
    }

    Vue.use(Plugin)
    const localVue = createLocalVue()
    localVue.use(Plugin)

    if (localVue._installedPlugins) {
      expect(localVue._installedPlugins.indexOf(Plugin)).to.equal(0)
    }
    expect(installCount).to.equal(2)
  })
})
