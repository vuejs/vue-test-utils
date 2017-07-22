import createLocalVue from '~src/create-local-vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import mount from '~src/mount'
import Component from '~resources/components/component.vue'

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
    VueRouter.installed = false
    VueRouter.install.installed = false
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

  it('sets installed to false inside Vue.use', () => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
    expect(Vuex.installed).to.equal(true)
    localVue.use(Vuex)
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$route).to.equal('undefined')
  })
})
