import Vue from 'vue'
import mount from '~src/mount'
import Component from '~resources/components/component.vue'

describe('mount.instance', () => {
  it('mounts component using passed instance as base instance', () => {
    const ScopedVue = Vue.extend()
    ScopedVue.version = '2.3'
    const wrapper = mount(Component, { instance: ScopedVue, intercept: { test: true }})
    expect(wrapper.vm.test).to.equal(true)
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.test).to.equal('undefined')
  })
})

