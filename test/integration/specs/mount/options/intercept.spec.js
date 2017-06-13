import mount from '~src/mount'
import Component from '../../../../resources/components/component.vue'

describe('mount.intercept', () => {
  it('injects global variables when passed as intercept object', () => {
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
})
