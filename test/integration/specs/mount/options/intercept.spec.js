import mount from '~src/mount'
import Component from '~resources/components/component.vue'

describe('mount.intercept', () => {
  it('adds variables to vm when passed as intercept object', () => {
    const $store = { store: true }
    const $route = { path: 'http://test.com' }
    const wrapper = mount(Component, {
      intercept: {
        $store,
        $route
      }
    })
    expect(wrapper.vm.$store).to.equal($store)
    expect(wrapper.vm.$route).to.equal($route)
  })

  it('does not affect global vue class when passed as intercept object', () => {
    const $store = { store: true }
    const wrapper = mount(Component, {
      intercept: {
        $store
      }
    })
    expect(wrapper.vm.$store).to.equal($store)
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.$store).to.equal('undefined')
  })
})
