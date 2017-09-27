import createLocalVue from '~src/create-local-vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import mount from '~src/mount'
import Component from '~resources/components/component.vue'
import ComponentWithVuex from '~resources/components/component-with-vuex.vue'

describe('createLocalVue', () => {
  it('installs Vuex without polluting global Vue', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store({
      state: {
        test: 0
      },
      mutations: {
        increment () {}
      }
    })
    const wrapper = mount(Component, { localVue, store })
    expect(wrapper.vm.$store).to.be.an('object')
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$store).to.equal('undefined')
  })

  it('Vuex should work properly with local Vue', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    const store = new Vuex.Store({
      state: {
        count: 0
      },
      mutations: {
        increment (state) {
          state.count++
        }
      },
      modules: {
        foo: {
          state: () => ({ bar: 1 })
        }
      }
    })
    const wrapper = mount(ComponentWithVuex, { localVue, store })
    expect(wrapper.vm.$store).to.be.an('object')
    expect(wrapper.text()).to.equal('0 1')
    wrapper.trigger('click')
    expect(wrapper.text()).to.equal('1 1')
  })

  it('installs Router without polluting global Vue', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const routes = [
      { path: '/foo', component: Component }
    ]
    const router = new VueRouter({
      routes
    })
    const wrapper = mount(Component, { localVue, router })
    expect(wrapper.vm.$route).to.be.an('object')
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$route).to.equal('undefined')
  })

  it('installs Router after a previous installed', () => {
    const localVue = createLocalVue()
    localVue.use(VueRouter)
    const routes = [
      { path: '/foo', component: Component }
    ]
    const router = new VueRouter({
      routes
    })
    const wrapper = mount(Component, { localVue, router })
    expect(wrapper.vm.$route).to.be.an('object')
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$route).to.equal('undefined')
  })
})
