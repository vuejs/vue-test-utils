import scopedVue from '~src/scoped-vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import mount from '~src/mount'
import Component from '~resources/components/component.vue'

describe('scopedVue', () => {
  it('installs Vuex without polluting global Vue', () => {
    const instance = scopedVue()
    instance.use(Vuex)
    const store = new Vuex.Store({
      state: {
        test: 0
      },
      mutations: {
        increment (state) {
          state.count++
        }
      }
    })
    console.log(Vuex.state)
    const wrapper = mount(Component, { instance, store })
    expect(wrapper.vm.$store).to.be.an('object')
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$store).to.equal('undefined')
  })

  it('installs Router without polluting global Vue', () => {
    const instance = scopedVue()
    instance.use(VueRouter)
    const routes = [
            { path: '/foo', component: Component }
    ]
    const router = new VueRouter({
      routes
    })
    const wrapper = mount(Component, { instance, router })
    expect(wrapper.vm.$route).to.be.an('object')
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$route).to.equal('undefined')
  })
})
