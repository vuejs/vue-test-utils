import Vue from 'vue'
import mount from '~src/mount'
import Component from '~resources/components/component.vue'

describe('mount.localVue', () => {
  it('mounts component using passed localVue as base Vue', () => {
    const localVue = Vue.extend()
    localVue.version = '2.3'
    const wrapper = mount(Component, { localVue: localVue, intercept: { test: true }})
    expect(wrapper.vm.test).to.equal(true)
    const freshWrapper = mount(Component)
    expect(typeof freshWrapper.vm.test).to.equal('undefined')
  })
})

